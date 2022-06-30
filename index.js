const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.wasvl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
        try {
                await client.connect();
                const informationsCollection = client.db("power-hack-pay-bill").collection("informations");

                // Load All Billing Information
                app.get('/api/billing-list', async (req, res) => {
                        const query = {};
                        const cursor = informationsCollection.find(query);
                        const billingList = await cursor.toArray();
                        res.send(billingList)
                })

                // Add New Billing Information:
                app.post('/api/add-billing', async (req, res) => {
                        const newBilling = req.body;
                        const insertNewBilling = await informationsCollection.insertOne(newBilling);
                        res.send(insertNewBilling);
                })
        }
        finally {

        }
}
run().catch(console.dir);

app.get('/', (req, res) => {
        res.send('Hello Power Hack!')
})

app.listen(port, () => {
        console.log(`PowerHack app listening on port ${port}`)
})
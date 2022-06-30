const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.wasvl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
        try {
                await client.connect();
                console.log("Database Connected")
                const informationsCollection = client.db("power-hack-pay-bill").collection("informations");

                // Load All Billing Information
                app.get('/api/billing-list', async (req, res) => {
                        const query = {};
                        const cursor = informationsCollection.find(query);
                        const billingList = await cursor.toArray();
                        res.send(billingList)
                })

                // Get Count:
                app.get("/bill-count", async (req, res) => {
                        const query = {};
                        const cursor = informationsCollection.find(query);
                        const count = await cursor.count();
                        res.send({ count });
                })

                // Add New Billing Information:
                app.post('/api/add-billing', async (req, res) => {
                        const newBilling = req.body;
                        const insertNewBilling = await informationsCollection.insertOne(newBilling);
                        res.send(insertNewBilling);
                })

                // Update Billing Information
                app.put('/api/update-billing/:id', async (req, res) => {
                        const id = req.params.id;
                        const updatedBill = req.body;
                        const filterItem = { _id: ObjectId(id) };
                        const options = { upsert: true };
                        const updateDoc = {
                                $set: {
                                        name: updatedBill.name,
                                        phone: updatedBill.phone,
                                        amount: updatedBill.amount,
                                }
                        }
                        const result = await informationsCollection.updateOne(filterItem, updateDoc, options);
                        res.send(result);
                })

                // Delete Bill Information:
                app.delete('/api/delete-billing/:id', async (req, res) => {
                        const id = req.params.id;
                        const query = { _id: ObjectId(id) };
                        const deletedBill = await informationsCollection.deleteOne(query);
                        res.send(deletedBill);
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
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
                const memberCollection = client.db("power-hack-pay-bill").collection("member");

                // Load All Billing Information
                app.get('/api/billing-list', async (req, res) => {
                        const page = parseInt(req.query.page);
                        const size = parseInt(req.query.size);
                        const email = req.query.email;

                        let query;
                        if (email) {
                                query = { email: email }
                        }
                        else {
                                query = {};
                        }
                        const cursor = informationsCollection.find(query);

                        let billingList;
                        if (page || size) {
                                billingList = await cursor.skip(page * size).limit(size).toArray();
                        }
                        else {
                                billingList = await cursor.toArray();
                        }
                        res.send(billingList)
                })

                // Get Count:
                app.get("/bill-count", async (req, res) => {
                        const email = req.query.email;
                        let query;
                        if (email) {
                                query = { email: email }
                        }
                        else {
                                query = {}
                        }
                        const cursor = informationsCollection.find(query);
                        const count = await informationsCollection.estimatedDocumentCount();
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


                // Registration People:
                app.post('/registration', async (req, res) => {
                        const newMember = req.body;
                        const registrationInformation = await memberCollection.insertOne(newMember);
                        res.send(registrationInformation);
                })
                // Load All Member:
                app.get('/members', async (req, res) => {
                        const query = {};
                        const cursor = memberCollection.find(query);
                        const members = await cursor.toArray();
                        res.send(members);
                })
        }
        finally {

        }
}
run().catch(console.dir);

// Root API
app.get('/', (req, res) => {
        res.send('Hello Power Hack!')
})

app.listen(port, () => {
        console.log(`PowerHack app listening on port ${port}`)
})
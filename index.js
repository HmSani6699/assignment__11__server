const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// MiddleWare
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.Db_user}:${process.env.Db_pass}@cluster0.fnxcgsn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toyCarCollction = client.db("toyCarDB").collection('toyCar');

        app.get('/addToy', async (req, res) => {
            const result = await toyCarCollction.find().toArray();
            res.send(result)
        })

        app.get('/toy', async (req, res) => {
            // console.log(req.query.email,'query');
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toyCarCollction.find(query).toArray();
            res.send(result)
        })

        app.get('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCarCollction.findOne(query);
            res.send(result);
        })


        app.post('/addToys', async (req, res) => {
            const checkOut = req.body;
            // console.log(checkOut);
            const result = await toyCarCollction.insertOne(checkOut);
            res.send(result);
        })

        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newToy = {
                $set: {
                    price: toy.price,
                    quentity: toy.quentity,
                    details: toy.details
                }
            }

            const result = await toyCarCollction.updateOne(filter, newToy, options)
            res.send(result)

        })
        
        // Delete
        app.delete('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCarCollction.deleteOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hallo assignmen comming son')
})

app.listen(port, () => {
    console.log('server is running');
})
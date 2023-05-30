const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// MiddleWare
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}
app.use(cors(corsConfig))

app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fnxcgsn.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const tabToyCarCollction = client.db('toyCarDB').collection('tabToy');
        const toyCarCollction = client.db("toyCarDB").collection('toyCar');

        //-------------------//
        // Indexing //
        //-------------------//
        const indexKeys = { name: 1 };
        const indexOptions = { name: "name" };
        const result =  toyCarCollction.createIndex(indexKeys, indexOptions);

        app.get("/getToyText/:text", async (req, res) => {
            const text = req.params.text;
            console.log(text);
            const result = await toyCarCollction.find({
                    $or: [
                        { name: { $regex: text, $options: "i" } }
                    ],
                }).toArray();
            res.send(result);
        });



        //-------------------//
        // Get all toy//
        //-------------------//
        app.get('/tabToy', async (req, res) => {
            const result = await tabToyCarCollction.find().toArray();
            res.send(result)
        });


        //-------------------//
        // Get all toy//
        //-------------------//
        app.get('/addToy', async (req, res) => {
            const result = await toyCarCollction.find().toArray();
            res.send(result)
        });


        //---------------//
        // Email user //
        //-------------------//
        app.get('/toy', async (req, res) => {
            // console.log(req.query.price);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }

            const result = await toyCarCollction.find(query).sort({ price: `${req.query.price}` }).toArray();
            res.send(result)
        });


        //-------------------//
        // Single Toy //
        //-------------------//
        app.get('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCarCollction.findOne(query);
            res.send(result);
        });


        //------------//
        // Post new Toy //
        //-------------------//
        app.post('/addToys', async (req, res) => {
            const checkOut = req.body;
            // console.log(checkOut);
            const result = await toyCarCollction.insertOne(checkOut);
            res.send(result);
        })


        // ----------------//
        // Update Toy //
        //-------------------//
        app.put('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(toy);
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

        });


        app.get("/allToy/:text", async (req, res) => {

            if (
                req.params.text === "Programmable" ||
                req.params.text === "RemoteControl" ||
                req.params.text === "TransformingRobots"
            ) {
                const result = await toyCarCollction.find({ status: req.params.text }).toArray();
                const limit = req.query.limit || 3;
                const limitedToyData = result.slice(0, limit);
                return res.json(limitedToyData);
            }
            const result = await toyCarCollction.find({}).toArray();
            const limit = req.query.limit || 3;
            const limitedToyData = result.slice(0, limit);
            res.json(limitedToyData);
        });


        //-------------------//
        // Delete Toy //

        app.delete('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCarCollction.deleteOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection

         client.db("admin").command({ ping: 1 });

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
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require("dotenv").config()
const cors = require('cors');
const port = process.env.PORT || 5000;

//MIDDLE WARE
app.use(express.json())
app.use(cors())

//MongoDB Connect
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.fpc6f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        client.connect()
        const database = client.db('DroneMart')
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        //GET PRODUCTS - API
        app.get('/products', async (req, res) => {

            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)

        });

        //GET SINGLE PRODUCT - API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destination = await productsCollection.findOne(query);
            res.send(destination)
        })

        //POST PRODUCTS - API 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)
        })

        //DELETE USER ORDER - API
        app.delete('/products/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        //GET ORDERS - API 
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders)
        })


        //POST ORDER - API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
        })

        //GET USER ORDER - API
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = ordersCollection.find({ email: email });
            const orders = await query.toArray()
            res.send(orders)
        })

        //DELETE USER ORDER - API
        app.delete('/orders/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        //UPDATE ORDER STATUS - API
        app.get('/orders/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { status: 'Shipped' }
            }
            const result = await ordersCollection.updateOne(query, updateDoc);
            res.json(result)
        })

        //POST REVIEW - API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
        })

        //GET REVIEWS - API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // GET USER 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true
            }
            res.json({admin: isAdmin})
        })

        //POST USER - API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log(result)
        })

        //PUT USER - API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options)
        })

        //PUT USER ADMIN - API
        app.put('/users/admin', async(req, rea) => {
            const user = req.body;
            const filter = {email: user.email}
            const updateDoc = {$set: {role: "admin"}}
            const result = await usersCollection.updateOne(filter, updateDoc)
        })
    }

    
    finally {
    //await client.close()
}
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("DroneMart server is running")
})

app.listen(port, () => {
    console.log('Listening to the port:', port)
})
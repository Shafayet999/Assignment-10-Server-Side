const express = require('express')
const app = express()
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT || 3000
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e6yugo6.mongodb.net/?appName=Cluster0`;
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

        //crud operations here
        const db = client.db("FoodLoversDB");
        const reviewCollection = db.collection("reviewColleciton");




        app.get("/topReviews", async (req, res) => {
            const query = { rating: -1 };
            const cursor = await reviewCollection.find().sort(query).limit(6);
            const result = await cursor.toArray();

            res.send(result);
        })
        app.get("/allReviews", async (req, res) => {
            const query = { date: -1 };
            const cursor = await reviewCollection.find().sort(query);
            const result = await cursor.toArray();

            res.send(result);
        })
        app.get("/reviewDetails/:id", async (req, res) => {
            const idFromClient = req.params.id;
            const query = { _id: new ObjectId(idFromClient) }
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })
        app.post("/allReviews", async (req, res) => {
            const newReview = req.body;
            console.log(newReview);
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })
        app.get("/reviewsByEmail", async (req, res) => {
            const emailFromClient = req.query.email;
            const query = { email: emailFromClient };
            const result = await reviewCollection.find(query).sort({ date: -1 }).toArray();
            res.send(result);
        });
        app.delete("/deleteReview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });
        app.put("/updateReview/:id", async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const result = await reviewCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            res.send(result);
        });
        //for favourite collection
        const favouriteCollection = db.collection("favouriteCollection");
        app.post("/addFavorite", async (req, res) => {
            const fav = req.body;
            const result = await favouriteCollection.insertOne(fav);
            res.send(result);
        });
        app.get("/myFavorites/:email", async (req, res) => {
            const email = req.params.email;
            const result = await favouriteCollection.find({ email }).toArray();
            res.send(result);
        });
        app.get("/myFavorites/:email/:reviewId", async (req, res) => {
            const { email, reviewId } = req.params;

            const exists = await favouriteCollection.findOne({
                email: email,
                reviewId: reviewId
            });

            res.send({ isFav: !!exists });
        });
        app.get("/search", async (req, res) => {
            const text = req.query.text;

            const result = await reviewCollection.find({
                foodName: { $regex: text, $options: "i" }
            }).toArray();

            res.send(result);
        });
        app.delete("/removeFavorite/:email/:reviewId", async (req, res) => {
            const { email, reviewId } = req.params;

            const result = await favouriteCollection.deleteOne({
                email,
                reviewId,
            });

            res.send(result);
        });













        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

run().catch(console.dir);
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = process.env.PORT || 5000

// wadelwere 
app.use(cors());
app.use(express.json())




 


const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASS}@cluster0.c96z3.mongodb.net/?retryWrites=true&w=majority`;

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
   
    const classes = client.db("GlobelSpeck").collection('classes');

    app.get('/classes', async(re1, res) => {
 
      const result = await classes.find().toArray();
      res.send(result)
 
    })














    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

 

app.get('/', (req, res) => {


    res.send("<h1>summer cump school project</h1>")


})


app.listen(PORT, ()=>{
    console.log('server listening ' + PORT )
})
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
    const instructors = client.db("GlobelSpeck").collection('Instructors');
    const user = client.db("GlobelSpeck").collection('user');
    const Addtocart = client.db("GlobelSpeck").collection('AddCart');


    app.post('/Addclass', async(req, res) => {

        const classData = req.body;
        console.log(classData)
        const result = await Addtocart.insertOne(classData)
        res.send(result)
    })
    app.get('/showClass', async(req, res) => {

        const useremail = req.query.email;

        const queryuser = {email:useremail} 
        console.log(queryuser)        
        const result = await Addtocart.find(queryuser).toArray()
        res.send(result)
    })


    app.post('/user', async(req, res) => {

       const userData = req.body
       const email = req.body.email
          
       const query = {email : email}
       const checkemail  = await user.findOne(query)
       console.log(checkemail)

       if(checkemail){
         res.send('email allready axist')
         return
       }
       
       console.log(userData)
       const result = await user.insertOne(userData)
       res.send(result)

    })

    app.get('/classes', async(re1, res) => {

      const result = await classes.find().sort({"enrollStudents" : -1}).limit(6).toArray();
      res.send(result) 
    })
    app.get('/Allclasses', async(re1, res) => {

      const result = await classes.find().toArray();
      res.send(result)      
    })

    app.get('/instructor', async(req, res) => {

      const result = await instructors.find().limit(6).toArray();
      res.send(result)
    })

    app.get('/Allinstructor', async(req, res) => {

      const result = await instructors.find().toArray();
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
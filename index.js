const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const PORT = process.env.PORT || 5000

console.log(process.env.STRIPE_SECRET)

// wadelwere 
app.use(cors());
app.use(express.json())




// jwt wedelwere 
const verifyjwt = (req, res, next) => {

  const authorization = req.headers.authorization;
  console.log(authorization)
  if(!authorization){

    return res.status(401).send({error: true, message: "unauthorized access token"})

  }
 
  // bearer token 
  const token = authorization.split(' ')[1]
  
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) =>{

    if(err){      
     return res.status(401).send({error: true, message: "unauthorized access"})
    }

    req.decoded = decoded

    next()

  })
}


 


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
    const payment = client.db('GlobelSpeck').collection('payment') 
    const user = client.db("GlobelSpeck").collection('user');
    const AddtoClass = client.db("GlobelSpeck").collection('AddCart');




    // jwt token genaret 
    app.post('/Jwt',(req,res)=>{
      
      const data = req.body
      const token = jwt.sign(data, process.env.JWT_ACCESS_TOKEN, {expiresIn: "1h"})
      res.send({token})

    })



    app.get("/user/Role/:email", verifyjwt, async(req, res) => {

      const email = req.params.email;    
      console.log(email)  
      if(req.decoded.email !== email){
        return res.status(401).send({error: true, message: "forbidden request"})
      }
      const query = {email:email}
      const userRole = await user.findOne(query)

      console.log(userRole)
      res.send(userRole.role)

    })
     

    app.post('/Addclass',  async(req, res) => {

        const classData = req.body;         
        const result = await AddtoClass.insertOne(classData)
        res.send(result)
    })

    // class add with instructor 
    app.post('/Addtoclass',  async(req, res) => {

        const classData = req.body;       
        console.log(classData)  
        const result = await classes.insertOne(classData)
        res.send(result)
    })
    app.delete('/deletAddclass',  async(req, res) => {
        const id = req.body.id
        console.log(id)
        const query = { _id : new ObjectId(id)}
        const result = await AddtoClass.deleteOne(query)
        res.send(result)
    })
    app.delete('/deletClass/:id',  async(req, res) => {
        const id = req.params.id
        console.log(id)
        const query = { _id : new ObjectId(id)}
        const result = await classes.deleteOne(query)
        res.send(result)
    })


    app.patch('/ApproveClass/:id', async(req,res)=>{

      const classId = req.params.id
       
      const filter = {_id : new ObjectId(classId)}
      
      const options = { upsert: true };
      const updatedoc = {
        $set:{
           status: "approved"
        }
      }

      const result = await classes.updateOne(filter, updatedoc, options)
      res.send(result)

    })


    app.patch('/notApproveClass/:id', async(req,res)=>{

      const classId = req.params.id
      const feedback = req.body.feedback
      console.log(feedback)
      const filter = {_id : new ObjectId(classId)}
      
      const options = { upsert: true };
      const updatedoc = {
        $set:{
           status: "denied",
           feedback:  feedback
        }
      }

      const result = await classes.updateOne(filter, updatedoc, options)
      res.send(result)
       
    })

    
    

    app.get('/user', verifyjwt,  async(req, res) => {

      if(!req.decoded.email){
        return res.status(401).send({error: true, message: "forbidden request"})
      }

       
      const result = await user.find().toArray();      
      res.send(result)
        
    })
    app.patch('/userAdmin/:id',  async(req, res) => {

      const userid = req.params.id
      const updateData = req.body.Updated
       
      const options = { upsert: true };
      const updateDoc = {           
        $set: {
          role : updateData 
        },
            
      };
      const filter = {
        _id: new ObjectId(userid) 
      }
      console.log(filter)
      
      const result = await user.updateOne(filter, updateDoc, options)
      res.send(result)
        
    })

    // user class show with email query 
    app.get('/showClass',  async(req, res) => {

        const useremail = req.query.email;
        const queryuser = {email:useremail} 
            
        const result = await AddtoClass.find(queryuser).toArray()
        res.send(result)
    })

    app.get('/insMyclass',  async(req, res)=>{

          const email = req.query.email
           
          const check = {instructorEmail : email}
          const result = await classes.find(check).toArray()
          console.log(result)
          res.send(result)

    })


    app.post('/user',  async(req, res) => {

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

    app.get('/FindAddClass/:id',async(req, res)=>{

        const id = req.params.id;
        console.log(id) 
        const result = await AddtoClass.findOne({accessId : id})
        res.send(result)

    })

    app.get('/classes',  async(re1, res) => {
      const query = {status : "approved"}
      const result = await classes.find(query).sort({"enrollStudents" : -1}).limit(6).toArray();
      res.send(result) 
    })
    app.get('/Allclasses',   async(req, res) => {

      const query = {status : "approved"}
      const result = await classes.find(query).toArray();
      res.send(result)      
    })
    app.get('/AllclassesAdmin',   async(req, res) => {

      
      const result = await classes.find().toArray();
      res.send(result)      
    })

    app.get('/instructor',  async(req, res) => {

      const result = await user.find({role:"instructor"}).limit(6).toArray();
      res.send(result)
    })

    app.get('/Allinstructor',  async(req, res) => {

      const result = await user.find({role:"instructor"}).toArray();
      res.send(result)
    })


    // payment getware 
    app.post("/create-payment-intent", verifyjwt, async (req, res) => {
      const  {price}  = req.body;
      const totalamount = price*100
      console.log(price,totalamount)
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await  stripe.paymentIntents.create({
        amount: totalamount,
        currency: "usd",
        // automatic_payment_methods: ['card'],
      }); 
      
      
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

// payment insert 


    app.post('/payment', verifyjwt, async(req,res)=>{

      const {user, email, tranjecttionId, price, cartName, cartImage} = req.body;

      const paymentData = {
        user,
        email,
        tranjecttionId,
        price,
        cartName,
        cartImage
      }

      
      const result = await payment.insertOne(paymentData)
      res.send((result))

    })


    app.patch('/updateEnroll/:accessId', async(req,res)=>{

      const accessId = req.params.accessId;
      console.log(accessId)
      const filter = {_id : new ObjectId(accessId) }
      const undatedoc =  { 
        $inc: { 
          availableSeats: -1 ,
          enrollStudents: 1 
       }
      }
      const option = {upsert : true}

      const result = await classes.updateOne(filter, undatedoc, option)
      res.send(result)

    })
    
    app.get('/PaymentHistory/:email',verifyjwt, async(req,res)=>{

      const email = req.params.email
      const result = await payment.find({email : email}).toArray()
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


app.listen(PORT)
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2k2a8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }



async function run() {
    try {
      await client.connect();
      const partCollection = client.db('phoenix_tech').collection('parts');
      const purchaseCollection = client.db('phoenix_tech').collection('purchases');
      const userCollection = client.db('phoenix_tech').collection('users');

    app.get('/part', async (req, res) => {
        const query = {};
        const cursor = partCollection.find(query);
        const parts = await cursor.toArray();
        res.send(parts);
      });

    app.get('/part/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const parts = await partCollection.findOne(query);
        res.send(parts);
    })

    app.post('/purchase', async (req, res) => {
        const purchase = req.body;
        const result = await purchaseCollection.insertOne(purchase);
        res.send(result)
    });

    app.get('/purchase',  async (req, res) => {
        const user = req.query.user;
        const query = {user:user}
          const purchase = await purchaseCollection.find(query).toArray();
        res.send(purchase);
        
         });

      app.get('/purchase', async (req, res) => {
        const purchase = await purchaseCollection.find().toArray();
        res.send(purchase);
      });

      app.get('/user', async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      });

      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result);
      });


      app.put('/user/admin/:email',  async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      })
     

      app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin })
      })


    }
      finally {

    }
  }
  
  run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Phoenix Tech')
  })

app.listen(port, () => {
  console.log(`listening on Phoenix port ${port}`)
  })
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

    app.get('/purchase', async (req, res) => {
        const user = req.query.user;
        const purchase = await purchaseCollection.find(user).toArray();
         res.send(purchase);
      });


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
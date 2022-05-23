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

async function run() {
    try {
      await client.connect();
      const partCollection = client.db('phoenix_tech').collection('parts');

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
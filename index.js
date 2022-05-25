const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
      const purchaseCollection = client.db('phoenix_tech').collection('purchases');
      const userCollection = client.db('phoenix_tech').collection('users');
      const profileCollection = client.db('phoenix_tech').collection('profiles');
      const reviewCollection = client.db('phoenix_tech').collection('reviews');
      const paymentCollection = client.db('phoenix_tech').collection('payments');

    app.get('/part', async (req, res) => {
        const query = {};
        const cursor = partCollection.find(query);
        const parts = await cursor.toArray();
        res.send(parts);
      });

    app.post('/part', async (req, res) => {
        const newpart = req.body;
        const result = await partCollection.insertOne(newpart);
        res.send(result);
      });

    app.get('/part/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const parts = await partCollection.findOne(query);
        res.send(parts);
    })

    app.post('/purchase', async (req, res) => {
        const query = req.body;
        const result = await purchaseCollection.insertOne(query);
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

      app.get('/purchase/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const purchase = await purchaseCollection.findOne(query);
        res.send(purchase);

      })

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

      app.post('/profile', async (req, res) => {
        const query = req.body;
        const result = await profileCollection.insertOne(query);
        res.send(result)
    });

    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post('/review', async (req, res) => {
      const query = req.body;
      const result = await reviewCollection.insertOne(query);
      res.send(result)
  });

  app.post('/create-payment-intent', async(req, res) =>{
    const service = req.body;
    const price = service.price;
    const amount = price*100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount : amount,
      currency: 'usd',
      payment_method_types:['card']
    });
    res.send({clientSecret: paymentIntent.client_secret})
  });

  app.patch('/purchase/:id', async(req, res) =>{
    const id  = req.params.id;
    const payment = req.body;
    const filter = {_id: ObjectId(id)};
    const updatedDoc = {
      $set: {
        paid: true,
        transactionId: payment.transactionId
      }
    }

    const result = await paymentCollection.insertOne(payment);
    const updatepurchase = await purchaseCollection.updateOne(filter, updatedDoc);
    res.send(updatepurchase);
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
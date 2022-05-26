const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.siqkc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
	try{
		await client.connect();
		const policeCollections = client.db('db_Indentificaiton').collection('police');
		const thanaCollections = client.db('db_Indentificaiton').collection('thana');

		app.get('/policeRegister/:email', async(req, res) => {
			const email = req.params.email;
			const query = {email: email};
			const result = await policeCollections.findOne(query);
			if(!result){
				return res.send(false);
			}
			res.send(result);
		})
		
		app.post('/policeRegister', async(req,res) => {
			const doc = req.body;
			const requesterEmail = doc.email;

			const query = {email: requesterEmail};
			const request = await policeCollections.findOne(query);

			if(!request){
				const result = await policeCollections.insertOne(doc);
				return res.send(result);
			} 
			return res.send(false);
			
		})

		app.put('/policeRegister', async(req, res) => {
			const doc = req.body;
			const requesterEmail = doc.email;
			const filter = {email: requesterEmail};
			const options = {upsert: true};
			const updateDoc = {
				$set: {
					name: doc.name,
					rangId: doc.rangId,
					responsibility: doc.responsibility,
					thana: doc.thana,
					phone: doc.phone,
					image: doc.image
				}
			}
			const result = await policeCollections.updateOne(filter, updateDoc, options);
			res.send(result);
		})

		app.get('/thana', async(req,res) => {
			const result = await thanaCollections.find().toArray();
			res.send(result);
		})

		app.get('/thanaById/:id',async(req, res) => {
			const id = req.params.id;
			const query = {_id: ObjectId(id)};
			const result = await thanaCollections.findOne(query);
			res.send(result);
		})

		app.get('/policeThana/:thana_id/:responsibility', async(req, res) => {
			const thana_id = req.params.thana_id;
			const responsibility  = req.params.responsibility;
			console.log(thana_id, responsibility);
			const query = {_id: ObjectId(thana_id)};
			const thana = await thanaCollections.findOne(query);
			const thana_name = thana.thana_name;

			const query2 = {thana: thana_name, responsibility:responsibility}
			const police = await policeCollections.find(query2).toArray();
			console.log(police);

			res.send(police);
		})
		
		app.get('/police/:id', async(req, res)=> {
			const id = req.params.id;
			const query = {rangId: id};
			const result = await policeCollections.findOne(query);
			res.send(result);
		})
		
		// Find Police by Rnage ID
		app.get('/policeSearch/:id', async(req,res) => {
			const id = req.params.id;
			const query = {rangId: id};
			const result = await policeCollections.findOne(query);
			if(result){
				return res.status(202).send(result);
			}
			res.status(404).send(
				{data:true}
			)
		})


	}
	finally{

	}
}
run().catch(console.dir);


app.get('/', async(req, res) => {
	res.send('Police Identification Server Running')
})
app.listen(port, () => {
	console.log('Server is Running');
})

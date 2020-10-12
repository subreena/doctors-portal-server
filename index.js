const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const port = 4000
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lkdxj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    const doctorsCollection = client.db("doctorsPortal").collection("doctors");

    console.log("Connected successfully")


    app.post("/addAppointment", (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get("/allAppointments", (req, res) => {
        appointmentCollection.find({})
            .toArray((err, appointments) => {
                //   console.log(appointments)
                res.send(appointments)
            })
    })
    app.post("/appointmentsByDate", (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorsCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })
        // console.log(date.date);


    })

    app.post('/addDoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/doctors', (req, res) => {
        doctorsCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
            })
    })
    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorsCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);

            })
    })



});


// respond with "hello world" when a GET request is made to the homepage

app.get('/', (req, res) => {
    res.send("Hello from doctors portal db. It works!")
})
app.listen(process.env.PORT || port);
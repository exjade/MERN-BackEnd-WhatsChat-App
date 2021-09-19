// Importing 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'


// App COnfig
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher(
    {
        // Get this data in pusher.com
        appId: "Api",
        key: "key",
        secret: "Secret",
        cluster: "us3",
        useTLS: true
    });

// Middlerware
app.use(express.json());
app.use(cors());
 
// DB COnfig
const connection_url = 'mongodb+srv://admin:<YourPassword>@cluster0.hgclc.mongodb.net/<YourDataBaseName>?retryWrites=true&w=majority'

mongoose.connect(connection_url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

const db = mongoose.connection

db.once('open', () => {
    console.log("Db connected")

    // So first im creating the collection, which is gonna be msgCollection
    const msgCollection = db.collection('messagecontents')
    //this collection is actually watching the change in our data base
    const changeStream = msgCollection.watch()


    // If one of the changes occured we could see into our change variable
    changeStream.on('change', (change) => {
        console.log("A change ocurred", change);

        // If the operationType is equals to answer, get fullDocument and save that into messageDetails
        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                }
            )
        } else {
            console.log('Error trigering Pusher')
        }

    });
});

// ?

// Api routes
app.get('/', (req, res) => res.status(200).send('This works'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            //internal server error 505
            res.status(500).send(err)
        } else {
            // 201 = Created Ok
            res.status(200).send(data)
        }
    });
});


app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    // Im using mongo to create a new message using the data that I create in the Body
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            //internal server error 505
            res.status(500).send(err)
        } else {
            // 201 = Created Ok
            res.status(201).send(data)
        }
    });
});

// Listen
app.listen(port, () => console.log(`Listening on Localhost:${port}`));

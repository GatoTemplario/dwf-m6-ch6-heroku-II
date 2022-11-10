// "module": "NodeNext" resuelve esto de que no reconozca express
import express from "express";
import { rtdb, fs, db} from "./db"
import { push, ref, set, onValue } from "firebase/database"
import * as nanoid from "nanoid"
import { doc, setDoc } from "firebase/firestore";
import cors from "cors"
import { AppCheck } from "firebase-admin/lib/app-check/app-check";

// usar yarn add cors@2.8.5

const port = process.env.PORT || 3000;
const app = express()

const usersCollection = fs.collection("users")
const roomsCollection = fs.collection("rooms")
// const collection = fs.collection("users") + collection.doc('1234') == const doc = fs.doc("users/1234")

app.use(express.json());
app.use(cors())
app.use(express.static("dist"))

app.listen(port, () => {
    console.log(`Example app listening http://localhost:${port}`);
})
app.get("/env", (req, res) => {
    res.json({
        enviroment: process.env.NODE_ENV
    })
})


app.post("/signup", (req, res) => {
    const email = req.body.email
    const {nombre} = req.body

    usersCollection.where("email", "==", email).get().then( searchResponse => {
        if(searchResponse.empty){
            usersCollection.add({
                email,
                nombre
            })
            .then( newUserRef => {
                res.json({
                    id: newUserRef.id,
                    new: true
                })
            })
        }else{
            res.status(400).json({
                message: "quien te conoce papa"
            })
        }
    })
})

app.post("/auth", (req, res) => {
    const {email} = req.body;
    usersCollection.where("email","==",email).get().then(searchResponse => {
        if(searchResponse.empty){
            res.status(404).json({
                message: "not found vieja"
            })
        }else{
            res.json({
                id: searchResponse.docs[0].id
            })
        }
    })
})

app.post("/rooms", (req, res) => {
    const {userId} = req.body
    
    const roomShortId = 1000 + Math.floor(Math.random() * 999)
    const newDbDocRef = doc(db, "rooms", roomShortId.toString())
    
    usersCollection.doc(userId).get().then( doc => {
        if (doc.exists){
            
            const rtdbRef = ref( rtdb, "rooms/" + nanoid.nanoid())
            
            set( rtdbRef, {
                messages: [] ,
                owner: userId
            })
            .then( () => {
                const roomLongId = rtdbRef.key;
                
                setDoc(newDbDocRef, {
                    rtdbRoomId: roomLongId
                })
                .then(()=>{
                    res.json({
                        rtdbRoomId: rtdbRef.key,
                        roomId: roomShortId.toString()
                    })
                })
            })
        }else{
            res.status(401).json({
                message:"quien so"
            })
        }
    })
})

//                                                              FORK DE LO ANTERIOR
app.get("/rooms/:roomId", (req, res) => {
    // el user id que mandamos por query es el que aparece en la RTDB como 'owner' (y te devuelve lo que aparece como nombre del campo). En fs, aparece el id corto y la respuesta al res.json (equivalente al nombre del campo en RTBDB)
    const {roomId} = req.params;
    
    roomsCollection.doc(roomId).get().then( snap => {
        const data = snap.data()
        res.json({data})
    })
})

app.post("/rooms/:roomId", (req, res) => {
    // const {userId} = req.body;
    const {from} = req.body;
    const {message} = req.body;
    const {roomId} = req.params;
    const rtdbRef = ref( rtdb, "rooms/" + roomId + "/messages")

    push( rtdbRef, {
        from,
        message
    })
})






const http = require('http');
const ws = require('ws');
const wsPort = 8080

// DE DONDE SALE ESTE PORT??
const wss = new ws.Server({port: 3100});

function accept(req, res) {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}


function onConnect(ws) {
    ws.on('message', function (message) {
    const rtdbRoomId = message.toString()
    const chatroomsRef = ref(rtdb,"/rooms/" + rtdbRoomId)
    
        
    onValue(chatroomsRef, snapshot => {
        const elyeison = JSON.stringify(snapshot.val())
        ws.send(elyeison)
    })
  });
}

if (!module.parent) {
  http.createServer(accept).listen(wsPort);
} else {
  exports.accept = accept;
}


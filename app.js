'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const service = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(service),
    databaseURL: "https://firmanbotline.firebaseio.com"
});

const db = admin.database();
const auth = admin.auth();
const ref = db.ref("server/saving-data/fireblog");

const config = {
    channelAccessToken: "m6oMTBwJCVIChmaV5Ek7uCVaq6CTNmm71Dg/OwJoOHFl59GAXah/4gaz5QFYaYrRtNrU8iucgzu1FIYlH2k5kTI1L+sug8gkVUZ+NO8Ll4qmICGSQKBidrAzK2q424lv5Jp/aGnmtXiOmSLtGn/IjQdB04t89/1O/w1cDnyilFU=",
    channelSecret: "03964adaec21355bf3f78f058079ab03",
};

const client = new line.Client(config);

const app = express();
app.use(bodyParser.raw());
app.use(logger('dev'));

app.post('/webhook', line.middleware(config), function(req, res){
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

function handleEvent(event){
    const userRef = db.child("users");
    userRef.set({
        alanisawesome: {
          date_of_birth: "June 23, 1912",
          full_name: "Alan Turing"
        },
        gracehop: {
          date_of_birth: "December 9, 1906",
          full_name: "Grace Hopper"
        }
      });
    const echo = { type: 'sticker', stickerId: event.message.stickerId, packageId: event.message.packageId };
    return clientLine.replyMessage(event.replyToken, echo);
}
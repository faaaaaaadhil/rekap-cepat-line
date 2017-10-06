'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')

const service = require('./service');

//configure mongodb
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://admin:admin@ds147534.mlab.com:47534/line-bot", {useMongoClient: true});

var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;


// configure line config
const config = {
  channelAccessToken: "m6oMTBwJCVIChmaV5Ek7uCVaq6CTNmm71Dg/OwJoOHFl59GAXah/4gaz5QFYaYrRtNrU8iucgzu1FIYlH2k5kTI1L+sug8gkVUZ+NO8Ll4qmICGSQKBidrAzK2q424lv5Jp/aGnmtXiOmSLtGn/IjQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "03964adaec21355bf3f78f058079ab03",
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.raw());

// create log http
app.use(logger('dev'));

//all proccess here
app.post('/webhook', line.middleware(config), function(req, res){
  console.log(req.body.events);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// all proccess handler
function handleEvent(event) {
  console.log(event);
  service.checkUser(event, client);
  if (event.type !== 'message') {
    return Promise.resolve(null);
  }

  conn.once('open', function(){
    console.log('open');

    var gfs = Grid(conn.db);

    var writestreamname = gfs.createWriteStream({
      filename: 'awe.jpg'
    });

  })

  client.getMessageContent(event.message.id)
  .then((stream) => {
    stream.on('data', (chunk) => {
      console.log(chunk.toString());
    })
    stream.on('error', (err) => {
      console.log(err);
    })
    stream.pipe(writestreamname)
    writestreamname.on('close', function(file){
      console.log(file.filename + 'Written To DB');
    })
  })

  // var masihsuci = event.message.text;
  // var udahnggasuci = masihsuci.toLowerCase();

  // if(event.message.type == 'text'){
  //   if(udahnggasuci.includes('boss nama toko')){
  //     console.log("toko terpanggil");
  //     service.setToko(event, client);
  //   }else if(udahnggasuci.includes('boss barang baru')){
  //     console.log("barang tambah terpanggil");
  //     service.addBarang(event, client);
  //   }else if(udahnggasuci.includes('boss barang laku')){
  //     console.log("barang laku terpanggil");
  //     service.barangLaku(event, client);
  //   }else if(udahnggasuci.includes('boss list barang')){
  //     console.log("list barang tepanggil");
  //     service.listBarang(event, client);
  //   }
  // }

  // if(event.message.type == 'text'){
  //   const echo = {
  //     "type": "template",
  //     "altText": "this is a buttons template",
  //     "template": {
  //         "type": "buttons",
  //         "thumbnailImageUrl": "https://images.unsplash.com/reserve/Af0sF2OS5S5gatqrKzVP_Silhoutte.jpg",
  //         "title": "Menu",
  //         "text": "Please select",
  //         "actions": [
  //             {
  //               "type": "message",
  //               "label": "Yes",
  //               "text": "yes"
  //             },
  //             {
  //               "type": "postback",
  //               "label": "Add to cart",
  //               "data": "action=add&itemid=123"
  //             },
  //             {
  //               "type": "uri",
  //               "label": "View detail",
  //               "uri": "http://example.com/page/123"
  //             }
  //         ]
  //     }
  //   };
  //   client.replyMessage(event.replyToken, echo);
  // }
  // else if(event.message.type == 'sticker'){
  //   const echo = { type: 'sticker', stickerId: event.message.stickerId, packageId: event.message.packageId };
  //   return client.replyMessage(event.replyToken, echo);
  // }else {
  //   return Promise.resolve(null);
  // }

  // if(event.message.type == 'image'){
    
  // }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

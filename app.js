'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const drx = require('dropbox');
const fs = require('fs');

const dropbox = new drx({ accessToken: '6N6VX7AUflAAAAAAAAAAFNYtTdxYjRpGQrVoRVwqJlP7pXxOJNJguBWeVCSA-CYQ' });
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
    console.log('Dropbox Status : ' + dropbox);
    const chunks = [];
    client.getMessageContent(event.message.id)
    .then((stream) => {
    //   stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
          chunks.push(chunk);
      })
      stream.on('error', (err) => {
        console.log(err);
      })
      stream.on('end', function(){

          var msg = Buffer.concat(chunks);
        dropbox.filesUpload({ path: '/test.jpg', contents: data })
            .then(function (response) {
              console.log(response);
            })
            .catch(function (err) {
              console.log(err);
            });
        })
      })
    //   stream.pipe()
    //   })
    })
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on ${port}');
});
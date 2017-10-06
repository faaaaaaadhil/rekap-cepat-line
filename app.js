'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const drx = require('dropbox');
const fs = require('fs');
const setting = require('./setting');

//model

const UserModel = require('./model/User');
const ProductModel = require('./model/Product');
const SimiModel = require('./model/Simi');

const dropbox = new drx({ accessToken: setting.dropboxAccessToken});

//configure mongodb
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://admin:admin@ds147534.mlab.com:47534/line-bot", {useMongoClient: true});

const client = new line.Client(setting.line);

const app = express();
app.use(bodyParser.raw());
app.use(logger(setting.build));

app.post(setting.webhook, line.middleware(setting.line), function(req, res){
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));    
});

app.post('/simi', function(req, res){

})

function handleEvent(event){
    console.log('Dropbox Status : ' + dropbox);
    console.log('Line Status : ' + line);
    console.log('Event Log :' + event);
    console.log('Mongoose Status : ' + mongoose);
    //indentifikasi pengguna baru atau bukan
    checkPengguna(event, false);

    if (event.type !== 'message') {
        return Promise.resolve(null);
    }

    if(event.message.type == 'text'){
        let keyword = event.message.text.toLowerCase();
        if(keyword.includes('!simi')){
            console.log('Simi terpanggil');
            simiSave(event, getContext(event));
        }else if(keyword.includes('!saveme')){
            console.log('save terpanggil');
            checkPengguna(event, true);
        }else if(keyword.includes('!toko') || keyword.includes('!tk')){
            console.log('toko terpanggil');
            setToko(event, getContext(event));
        }else if(keyword.includes('!add') || keyword.includes('!tambah') || keyword.includes('!a') || keyword.includes('!t')){
            console.log('setproduk terpanggil');
            setProduct(event, getContext(event));
        }else if(keyword.includes('!min') || keyword.includes('!laku') || keyword.includes('!m') || keyword.includes('!l')){
            console.log('minproduk terpanggil');           
            minProduk(event, getContext(event));
        }else if(keyword.includes('!help') || keyword.includes('!h')){
            console.log('help terpanggil');
            pushHelp(event);
        }else{
            console.log('anything terpanggil');
            simiSync(event);
        }
        // else if(keyword.includes('!image') || keyword.includes('!pic') || keyword.includes('!img') || keyword.includes('!i')){}
    }else{
        console.log('anything terpanggil');
        simiSync(event);
    }
    // else if(event.message.type == 'image'){}
}

function simiSync(event){
    SimiModel.find({}, function(err, res){
        if(res){
            console.log(res);
            const echo = { 
                type: 'text', 
                text: res.jawab
            };
            return client.replyMessage(event.replyToken, echo);
        }else{
            console.log(err);
            pushHelp(event);
        }
    })
}

function simiSave(event, data){
    let exec = data;
    exec = exec.split(',');

    let data0 = exec[0];
    let data1 = exec[1];

    let kurama = {
        'userIds': event.source.userId.toString(),
        'jika': data0.toString(),
        'jawab': data1.toString()
    }
    let simisimi = new SimiModel(kurama);
    SimiModel.findOne({'userIds': event.source.userId}, function(err, res){
        if(res){
            const echo = { 
                type: 'text', 
                text: 'Sudah ada boss :D'
            };
            return client.replyMessage(event.replyToken, echo);
        }else {
            simisimi.save(function(err, res){
                if(res){
                    const echo = { 
                        type: 'text', 
                        text: 'Terimakasih boss udah ngajarin :D'
                    };
                    return client.replyMessage(event.replyToken, echo);
                }else {
                    const echo = { 
                        type: 'text', 
                        text: 'Error bos :D'
                    };
                    return client.replyMessage(event.replyToken, echo);
                }
            })
        }
    })
}

//jika true = update or false = tambah
function checkPengguna(event, type){
    if(!type){
        client.getProfile(event.source.userId)
            .then((profile) => {
                let pictureUrl = profile.pictureUrl;
                let statusMessage = profile.statusMessage;
                let randomKode = Math.floor(100000 + Math.random() * 900000)
                randomKode = randomKode.toString().substring(0,4);
        
                if(pictureUrl == undefined){
                    pictureUrl = '';
                }
            
                if(statusMessage == undefined){
                    statusMessage = '';
                }
            
                let data = {
                    'displayName': profile.displayName,
                    'userIds': profile.userId,
                    'pictureUrl': pictureUrl,
                    'statusMessage': statusMessage,
                    'namaToko': '',
                    'kode': randomKode.toString()
                }; 
                
                let userdata = new UserModel(data);
                UserModel.findOne({'userIds': profile.userId}, 
                function(err, res){
                    if(res){
                        Promise.resolve(null);
                    }else{
                        userdata.save(function(err, res){
                            if(res){
                                const echo = { 
                                    type: 'text', 
                                    text: 'beberapa perintah membutuhkan akses lebih sehingga kami menyediakan kode pengguna, kode pengguna anda '+randomKode+''+setting.help
                                };
                                client.replyMessage(event.replyToken, echo);                            
                            }else{
                                const echo = { 
                                    type: 'text', 
                                    text: 'Kesalahan, ketika saya mencoba menyimpan data anda' 
                                };
                                client.replyMessage(event.replyToken, echo);
                            }
                        });
                    }
                });
            })
            .catch((err) => {
                console.log(err);
                Promise.resolve(null);
            });
    }else if(type){
        client.getProfile(event.source.userId)
            .then((profile) => {
                let pictureUrl = profile.pictureUrl;
                let statusMessage = profile.statusMessage;
                let randomKode = Math.floor(100000 + Math.random() * 900000)
                randomKode = randomKode.toString().substring(0,4);

                if(pictureUrl == undefined){
                    pictureUrl = '';
                }
            
                if(statusMessage == undefined){
                    statusMessage = '';
                }
                
                UserModel.findOne({'userIds': event.source.userId}, 
                function(err, res){
                    if(res){
                        UserModel.findOneAndUpdate({ '_id': res._id }, { $set: { 'displayName': profile.displayName, 'pictureUrl': pictureUrl, 'statusMessage': statusMessage, 'kode': randomKode.toString()} }, 
                        function(err, res){
                            if(res){
                                const echo = { 
                                    type: 'text', 
                                    text: 'untuk memperbarui keamanan saya membuat ulang kode pengguna anda, kode pengguna anda '+randomKode 
                                };
                                return client.replyMessage(event.replyToken, echo);
                            }else{
                                checkPengguna(event, false);
                            }
                        })
                    }else{
                        checkPengguna(event, false);
                    }
                })
            })
            .catch((err) => {
                console.log(err);
                Promise.resolve(null);
            });
    }
}

//jika true = update or false = tambah
function setToko(event, tk){
    let namaToko = tk;
    UserModel.findOne({'userIds': event.source.userId}, function(err, res){
        if(res){
            UserModel.findOneAndUpdate({ '_id': res._id }, { $set: { 'namaToko': namaToko } }, 
            function(err, res){
                if(res){
                    const echo = { 
                        type: 'text', 
                        text: 'Berhasil, sekarang nama toko anda adalah '+ namaToko 
                    };
                    return client.replyMessage(event.replyToken, echo);
                }else{                
                    const echo = { 
                        type: 'text', 
                        text: 'Kesalahan, dalam mengganti nama toko anda'+setting.help
                    };
                    return client.replyMessage(event.replyToken, echo);
                }
            })
        }else{
            console.log(err);
            checkPengguna(event, false);
        }
    })
}

//{nama produk},{harga produk},{stok produk} or {nama produk},{stok}
function setProduct(event, data){
    let exec = data;
    exec = exec.split(',');

    let data0 = exec[0];
    let data1 = exec[1];
    let data2 = exec[2];

    if(data2 == undefined || data2 == null){
        ProductModel.findOneAndUpdate({'findName': data0.toLowerCase()}, { $set: { 'stokbarang': data1.toString() } }, function(err, res){
            if(res){
                const echo = { 
                    type: 'text', 
                    text: 'barang sudah di update'+setting.help
                };
                return client.replyMessage(event.replyToken, echo);
            }else{
                const echo = { 
                    type: 'text', 
                    text: 'Kesalahan, pastikan penulisan dengan benar'+setting.help
                };
                return client.replyMessage(event.replyToken, echo);
            }
        })
    }else{
        let data = {
            'displayName': data0.toString(),
            'findName': data0.toLowerCase(),
            'harga': data1.toString(),
            'barang': data2.toString(),
            'terjual': '0',
            'status': 'masih'
        };

        let barang = new ProductModel(data);
        ProductModel.findOne({'findName': data0.toLowerCase()}, 
        function(err, res){
            if(res){
                const echo = { 
                    type: 'text', 
                    text: 'barang yang anda masukan sudah ada'+setting.help
                };
                return client.replyMessage(event.replyToken, echo);
            }else{
                console.log(err);
                barang.save(function(err, res){
                    if(res){
                        const echo = { 
                            type: 'text', 
                            text: 'barang sudah tersimpan'+setting.help 
                        };
                        return client.replyMessage(event.replyToken, echo);
                    }else{
                        console.log(err);
                        const echo = { 
                            type: 'text', 
                            text: 'Kesalahan, dalam menambah barang anda'+setting.help
                        };
                        return client.replyMessage(event.replyToken, echo);
                    }
                })
            }
        })
    }
}


function minProduk(event, data){
    let exec = data;
    exec = exec.split(',');

    let data0 = exec[0];
    let data1 = exec[1];

    ProductModel.findOne({'findName': data0.toLowerCase()}, 
    function(err, res){
        if(res){
            let stokbarang = res.barang;
            let terjual = res.terjual;
            let status = 'masih';
            if(data1 == undefined || data1 == null){
                stokbarang = parseInt(stokbarang) - 1;
                terjual = parseInt(terjual) + 1;
            }else {
                stokbarang = parseInt(stokbarang) - parseInt(data1+'');
                terjual = parseInt(terjual) + parseInt(data1+'');
            }
            
            if(stokbarang > 0){
                status = 'masih';
            }else{
                status = 'habis';
            }

            ProductModel.findOneAndUpdate({'findName': data0.toLowerCase()}, { $set: { 'barang': stokbarang, 'terjual': terjual, 'status': status } }, 
            function(err, res){
                if(res){
                    const echo = { 
                        type: 'text', 
                        text: 'Berhasil, stok barang anda '+status+' dengan total barang terjual '+terjual+' barang'
                    };
                    return client.replyMessage(event.replyToken, echo);
                }else{
                    const echo = { 
                        type: 'text', 
                        text: 'Kesalahan, pastikan penulisan dengan benar'+setting.help
                    };
                    return client.replyMessage(event.replyToken, echo);
                }
            })
        }else{
            const echo = { 
                type: 'text', 
                text: 'barang yang anda masukan belum terdaftar'+setting.help
            };
            return client.replyMessage(event.replyToken, echo);
        }
    })
}

function pushHelp(event){
    const echo = { 
        type: 'text', 
        text: 'berikut perintah penggunaan bot \n'+
        '!h -> melihat perintah penggunaan \n'+
        '!saveme -> menyimpan profile anda \n'+
        '!toko {nama toko} -> menyimpan nama toko anda \n'+
        '!add or !tambah {nama produk},{harga produk},{stok produk} or {nama produk},{stok} \n'+
        '!laku or !min {nama produk} or {np},{jmllaku} -> mengurangi stok produk anda \n'+
        '!image {kode},{produk},{image} -> menambah image pada produk \n'+
        '!report {pdf} or {docs} or {excel} -> melihat report penjualan \n'
    };
    return client.replyMessage(event.replyToken, echo);
}

// data = !saveme,!s,!toko,!tk,!add,!tambah,!a,!t,!min,!laku,!m,!l,!help,!h
function getContext(event){
    let textnya = '';
    let dataText = event.message.text.toLowerCase();
    if(dataText.includes('!simi')){
        textnya = '!simi';
    }else if(dataText.includes('!saveme')){
        textnya = '!saveme';
    }
    // else if(dataText.includes('!s')){
    //     textnya = '!s';
    // }
    else if(dataText.includes('!toko')){
        textnya = '!toko';
    }else if(dataText.includes('!tk')){
        textnya = '!tk';
    }else if(dataText.includes('!add')){
        textnya = '!add';
    }else if(dataText.includes('!tambah')){
        textnya = '!tambah';
    }else if(dataText.includes('!a')){
        textnya = '!a';
    }else if(dataText.includes('!t')){
        textnya = '!t';
    }else if(dataText.includes('!min')){
        textnya = '!min';
    }else if(dataText.includes('!laku')){
        textnya = '!laku';
    }else if(dataText.includes('!m')){
        textnya = '!m';
    }else if(dataText.includes('!l')){
        textnya = '!l';
    }else if(dataText.includes('!help')){
        textnya = '!help';
    }else if(dataText.includes('!h')){
        textnya = '!h';
    }
    dataText = dataText.trim();
    dataText = dataText.replace(textnya.toString(),'');
    dataText = dataText.trim();
    return dataText;
}

const port = process.env.PORT || setting.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
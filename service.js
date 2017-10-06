const UserModel = require('./model/User');
const ProductModel = require('./model/Product');

module.exports = {
    checkUser(event, client){
        client.getProfile(event.source.userId).then((profile) => {
            var pictureUrl = profile.pictureUrl;
            var statusMessage = profile.statusMessage;
            if(pictureUrl == undefined){
              pictureUrl = ''
            }
        
            if(statusMessage == undefined){
              statusMessage = ''
            }
        
            let data = {
              'displayName': profile.displayName,
              "userIds": profile.userId,
              'pictureUrl': pictureUrl,
              'statusMessage': statusMessage,
              'namaToko': ''
            }; 
        
            console.log(data);
        
            let userdata = new UserModel(data);
            UserModel.findOne({'userIds': profile.userId}, function(err, res){
              console.log(err);
              if(res){
                console.log(res);
                return Promise.resolve(null);
              }else{
                userdata.save(function(err, res){
                  const echo = { type: 'text', text: 'berhasil menyimpan profile anda' };
                  return client.replyMessage(event.replyToken, echo);
                });
              }
            });
          })
          .catch((err) => {
            console.log(err);
            const echo = { type: 'text', text: "Maaf" };
            return client.replyMessage(event.replyToken, echo);
          });
    },
    setToko(event, client){
        var namaToko = event.message.text; //"boss nama toko !kadal junedi";
        namaToko = namaToko.trim();
        var str = event.message.text;
        str = str.trim();
        var n = str.indexOf("!");
        var res = str.slice(0, n);
        namaToko = namaToko.replace(res, '');
        namaToko = namaToko.replace('!','');
        namaToko = namaToko.trim();

        UserModel.findOne({'userIds': event.source.userId}, function(err, res){
            if(res){
                UserModel.findOneAndUpdate({ '_id': res._id }, { $set: { 'namaToko': namaToko } }, function(err, res){
                    if(res){
                        console.log(res);
                        const echo = { type: 'text', text: "Beres bos \uDBC0\uDC84" };
                        return client.replyMessage(event.replyToken, echo);
                    }else{
                        console.log(err);
                        const echo = { type: 'text', text: "Ada kesalahan bos" };
                        return client.replyMessage(event.replyToken, echo);
                    }
                })
            }else{
                console.log(err);
                const echo = { type: 'text', text: "Ada kesalahan bos" };
                return client.replyMessage(event.replyToken, echo);
            }
        })
    },
    addBarang(event, client){
        var dataString = event.message.text;
        dataString = dataString.trim();
        var str = event.message.text;
        str = str.trim();
        var n = str.indexOf("!");
        var res = str.slice(0, n);
        dataString = dataString.replace(res, '');
        dataString = dataString.replace('!','');
        dataString = dataString.trim();
        dataString = dataString.split("|");
        var findnames = dataString[0].toLowerCase();
        let data = {
            'displayName': dataString[0]+'', //Tas ransel
            'findName': findnames+'',
            'harga': dataString[1]+'',//Rp. 100.000
            'stokbarang': dataString[2]+'',//9
            'terjual': '0', //10
            'statusMessage': 'masih' //habis - masih
        };

        let barang = new ProductModel(data);
        console.log("baranng : "+data);
        ProductModel.findOne({'findName': findnames}, function(err, res){
            if(res){
                console.log(res);
                const echo = { type: 'text', text: "Barang sudah ada bos" };
                return client.replyMessage(event.replyToken, echo);
            }else{
                barang.save(function(err, res){
                    if(res){
                        console.log(res);
                        const echo = { type: 'text', text: "Beres bos \uDBC0\uDC84" };
                        return client.replyMessage(event.replyToken, echo);
                    }else{
                        console.log(err);
                        const echo = { type: 'text', text: "Ada kesalahan bos" };
                        return client.replyMessage(event.replyToken, echo);
                    }
                })
            }
        })
    },
    barangLaku(event, client){
        var dataString = event.message.text;
        dataString = dataString.trim();
        var str = event.message.text;
        str = str.trim();
        var n = str.indexOf("!");
        var res = str.slice(0, n);
        dataString = dataString.replace(res, '');
        dataString = dataString.replace('!','');
        dataString = dataString.trim();
        dataString = dataString.split("|");
        var findnames = dataString[0].toLowerCase();
        ProductModel.findOne({'findName': findnames}, function(err, res){
            if(res){
                var stokbarang = res.stokbarang;
                var terjual = res.terjual;
                var status = 'masih';
                stokbarang = parseInt(stokbarang) - parseInt(dataString[1]+'');
                terjual = parseInt(terjual) + parseInt(dataString[1]+'');
                if(stokbarang > 0){
                    status = 'masih';
                }else{
                    status = 'habis';
                }
                ProductModel.findOneAndUpdate({'findName': findnames}, { $set: { 'stokbarang': stokbarang, 'terjual': terjual, 'statusMessage': status } }, function(err, res){
                    if(res){
                        console.log(res);
                        const echo = { type: 'text', text: "Beres bos \uDBC0\uDC84" };
                        return client.replyMessage(event.replyToken, echo);                    
                    }else{
                        console.log(err);
                        const echo = { type: 'text', text: "Ada kesalahan bos" };
                        return client.replyMessage(event.replyToken, echo);
                    }
                })
            }else{
                console.log(err);
                const echo = { type: 'text', text: "Ada kesalahan bos" };
                return client.replyMessage(event.replyToken, echo);
            }
        })
    },
    listBarang(event, client){
        ProductModel.find({}, function(err, res){
            if(res){
                console.log(res);
                var textnya = "";
                textnya = "Beres bos \uDBC0\uDC84";
                textnya = textnya + "\n =====Product=====";
                for(var i = 0; i < res.length; ++i) {
                    //1. nama harga stok terjual status
                    textnya = textnya + "\n No | Nama barang | Harga | Stok | Terjual | Status";
                    textnya = textnya + "\n "+(i+1)+". "+res[i].displayName+" | "+res[i].harga+" | "+res[i].stokbarang+" | "+res[i].terjual+" | "+res[i].statusMessage
                }
                const echo = { type: 'text', text: textnya };
                return client.replyMessage(event.replyToken, echo);     
            }else{
                console.log(err);
                const echo = { type: 'text', text: "Ada kesalahan bos" };
                return client.replyMessage(event.replyToken, echo);
            }
        })
    }
}
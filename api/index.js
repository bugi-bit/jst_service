var express = require('express');
var r = express.Router();

// load pre-trained model
const model = require('./sdk/model.js');
const cls_model = require('./sdk/cls_model.js');

// Bot Setting
const TelegramBot = require('node-telegram-bot-api');
const token = '1704389072:AAGoEj3PPBluDeHEUAI5NW_coKQkrpeZVuc'
const bot = new TelegramBot(token, {polling: true});

state = 0;
// bots
bot.onText(/\/start/, (msg) => { 
       bot.sendMessage(
        msg.chat.id,
        `hello ${msg.chat.first_name}, welcome...\n
        click /predict`
    );  
    state = 0;
});

bot.onText(/\/predict/, (msg) => { 
    bot.sendMessage(
        msg.chat.id,
        `Masukan nilai i|v contohnya 9|9`
    );   
    state = 1
});
bot.on('message', (msg) => {
    if(state == 1){
        s = msg.text.split("|");   
        model.predict(
        [
           parseFloat(s[0]),
           parseFloat(s[1])
        ]
        ).then((jres1)=>{
            console.log(jres1);
          
              cls_model.classify([parseFloat(s[0]),parseFloat(s[1]), parseFloat(jres1[0]),parseFloat(jres1[1])]).then((jres2) => {
                bot.sendMessage(
                    msg.chat.id,
                    `nilai V yang diprediksi adalah ${jres1[0]} volt`
        ); 
                bot.sendMessage(
                    msg.chat.id,
                    `nilai P yang diprediksi adalah ${jres1[1]} watt`
        );
                 bot.sendMessage(
                    msg.chat.id,
                    `klasifikasi Tegangan ${jres2}`
                     
                 );
            })
        })
    }else{
     
    state = 0;
    }
})

// routers
r.get('/classify/:i/:r', function(req, res, next) {    
    model.predict(
        [
            parseFloat(req.params.i), // string to float
            parseFloat(req.params.r)
        ]
    ).then((jres)=>{
        cls_model.classify(
            [
                parseFloat(req.params.i), // string to float
                parseFloat(req.params.r),
                parseFloat(jres[0]),
                parseFloat(jres[1])
        ]
        ).then((jres_)=>{
        res.json({jres, jres_})
    })
    })
});

module.exports = r;

// MongoDB Setup

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';

// Socket Setup
const net = require('net');
const proxy = new net.Socket();
const commandServer = new net.Server();

// Other Plugins
const moment = require('moment');

// Mail Notifier
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'GalapagosMonitor@gmail.com',
        pass: 'Galapagos496'
    }
});

const mailOptions = {
    from: 'GalapagosMonitor@address.com', // sender address
    to: 'hk.xu@mail.utoronto.ca', // list of receivers
    subject: 'This is a warning email!', // Subject line
    html: '<p>Your board is burning!</p>'// plain text body
};

// Filesys 
const fs = require('fs');

// Global vars
var Boarddata = JSON.parse(fs.readFileSync('board_data.json', 'utf8'));
for (item in Boarddata){
    console.log(Object.keys(Boarddata[item]));
    /* Will use shortly*/
}
    
var failedList = []; // List for unconnected proxies. Will recall connect every 15 secs

// =============================== Setup End ==================================

// Temperature Proxy

// TODO: Hard coding at this moment. Need to be updated to follow board_data.json
// After having valid list, use for loop here.
proxy.connect(9527, '127.0.0.1', function(){
    // if (err) failedList.push(Boarddata[item]);
    console.log('Connection Setup.');
    proxy.setEncoding("utf8");
    proxy.write('Ready');
})

proxy.on('error',function(res){
    console.log('\x1b[34mProcess\x1b[0m -> Connection on ' + res.address + '/' + res.port + ' failed.')
    console.log('\x1b[34mProcess\x1b[0m -> Code: ' + res.code);
});

proxy.on('data', function(data) {
    console.log('\x1b[34mProcess\x1b[0m -> Data Received: ' + data);
    // Connect Database
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db){
        console.log("\x1b[34mProcess\x1b[0m -> Database connected.");

        var temperature = db.db("temperature");

        var timeStamp = moment().format("MMM Do YY, h:mm:ss a");
        var obj = { temp: parseFloat(data), time: timeStamp };

        temperature.collection("114514").insertOne(obj, function(err, res) {
            if (err) throw err;
            // console.log(res);
            console.log("\x1b[34mProcess\x1b[0m -> Record: temp: "+obj.temp+" time: "+obj.time+" has added to database.");
        });

        // If overheated, trigger alert mail. (TODO: How to define threshold value here? At last structure diagram p_process should not talk to web server.)
        if (parseFloat(data) >= 100) {
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                    console.log(err) ;
                else
                    console.log(info);
            });
            console.log('\x1b[34mProcess\x1b[0m -> Alert email sent. Temperature at the moment is' + data);
        }
        
        db.close();
        console.log("\x1b[34mProcess\x1b[0m -> Database disconnected.");
    });
});

proxy.on('close', function() {
    console.log('\x1b[34mProcess\x1b[0m -> Target connection has closed.');
    proxy.end();
});

setInterval(() => {
    for (board in failedList) {
        proxy.connect(failedList[board].port, failedList[board].IP, function(){
            // if (err) throw err;
            console.log('Connection Setup.');
            proxy.setEncoding("utf8");
            proxy.write('Ready');
        })
    }
}, 15000);


// Command Server
commandServer.listen({
    host: 'localhost',
    port: 8013,
    exclusive: true
});

commandServer.on('connection', function(){
    console.log('\x1b[34mProcess\x1b[0m -> A new client connection from ...'); // TODO: track client IP
})

commandServer.on('error', function(err){
    console.log('\x1b[34mProcess\x1b[0m -> An error occured.'); // TODO: track client IP
    throw err;
})
// Filesys 
const fs = require('fs');

// Global vars
var Boarddata = JSON.parse(fs.readFileSync('board_data.json', 'utf8'));
var BoardNames = [];
for (item in Boarddata) {
    BoardNames.push(item);
} // Used for proxy setup. AddEventListener will skew up if using for .. in, thus we have to use forEach.

// Socket Setup
const net = require('net');

// MongoDB Setup

const MongoClient = require('mongodb').MongoClient;
const DB = require('mongodb').Db;
const MongoServer = require('mongodb').Server;
const db_url = 'mongodb://localhost:27017/';

var proxy = {};
var timer = {};

// proxy["Simulated"] = new net.Socket();   // localhost 9527
proxy["Real_board"] = new net.Socket();   // 10.1.2.180 - 7
Boarddata["Real_board"] = {
    "ID": 360008,
    "IP": "10.1.2.180", 
    "port": "7"
};

var unconnected = {};

// Other Plugins
const moment = require('moment');

// Protocol Code
const REQ_TEMP = 1;
const RESP_TEMP = 2;
const RST_CMD = 3;
const RST_ACK = 4;
const RST_UACK = 5;
const THR_CMD = 6;
const THR_ACK = 7;
const THR_UACK = 8;
const MEM_R = 9;
const MEM_R_ACK = 10;
const MEM_R_UACK = 11;
const MEM_W = 12;
const MEM_W_ACK = 13;
const MEM_W_UACK = 14;

// Command Status Code
const ONSUCCESS = 1;
const ONFAILURE = 2;

// Command  Opcode
const BRD_RST = 1;
const BRD_THR = 2;
const BRD_MEM_R = 3;
const BRD_MEM_W = 4;
const DCA_ALRT_CAP = 5;

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

// =============================== Setup End ==================================

// proxy and db setup
BoardNames.forEach(function(board){
    // console.log(board);
    var board_id = Boarddata[board].ID;

    proxy[board] = new net.Socket();
    proxy[board].setTimeout(15000);

    // console.log(Boarddata[board].IP +'/'+Boarddata[board].port);
    // First Connection
    proxy[board].connect(Boarddata[board].port, Boarddata[board].IP, function(err){
        if (err) { 
            console.log(err);
            return;
        }
            
        console.log('\x1b[32mProxy Connect\x1b[0m -> Board ' + board + ' Connection Setup on '+ Boarddata[board].IP +'/'+Boarddata[board].port+'.');

        timer[board] = setInterval(() => {
            const buffer = Buffer.alloc(4);
            buffer.writeUInt32LE(1,0)
            proxy[board].write(buffer);
        }, 1000);

    });

    // Event Handler
    proxy[board].on('timeout', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' timeout and is disconnecting.');
        proxy[board].end();
    });

    proxy[board].on('close', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection has closed.');
        unconnected[board] = 1;
    });

    proxy[board].on('end', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection has ended.');
        // unconnected[board] = 1;
    });

    proxy[board].on('error',(res) =>{
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection: ' + res.address + '/' + res.port + ' met error. Error Code: ' + res.code);
    });

    proxy[board].on('data', (data) => {
        console.log('\x1b[32mProxy Packet\x1b[0m -> From board '+ board +': data received.');
        var buffer = Buffer.from(data);
    
        if (buffer[0] == RESP_TEMP){
            // console.log(buffer.readInt32LE(4));
            var converted_temp = buffer.readInt32LE(4) * 501.3743 / 1024 - 273.6777;
            console.log('\x1b[32mProxy Packet\x1b[0m -> From board '+ board +': Temperature received ' + converted_temp);
            var timeStamp = moment().format("MMM Do YY, h:mm:ss a");
            var obj = { temp: converted_temp, time: timeStamp };
            
            // Connect Database
            MongoClient.connect(db_url, { useNewUrlParser: true }, function(err, db){
                console.log("\x1b[34mProcess\x1b[0m -> Database connected.");

                var temperature = db.db("temperature");

                temperature.collection(board_id.toString()).insertOne(obj, function(err, res) {
                    if (err) throw err;
                    console.log("\x1b[34mProcess\x1b[0m -> Record: temp: "+obj.temp+" time: "+obj.time+" has added to Temperaure database under collection "+board_id.toString()+".");
                });

                // If overheated, trigger alert mail. (TODO: DCA_MAIL_CAP.)
                if (obj.temp >= 100) {
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
        }
    
        if (buffer[0] == 10){
            // int32 has 4 byte alignment. Check first.
            var payload_len = buffer.length - 4;
            
            console.log('\x1b[32mProxy Packet\x1b[0m -> From 10.1.2.166: Memory reading packet received. Length: ' + payload_len);
    
            var payload_len_tail = payload_len % 4;
            // var payload_len_aligned = payload_len - payload_len_tail;
            if (payload_len_tail) {
                console.log('\x1b[91mProxy Packet Error\x1b[0m -> From 10.1.2.166: \x1b[31mERROR!\x1b[0m Payload is unaligned.');
                return;
            }
    
            var i;
            var payload = '';
            for (i = 0; i < payload_len; i+= 4) {
                payload += buffer.readUInt32LE(4+i).toString(16);
                payload += ' ';
            }

            console.log('\x1b[32mProxy Packet\x1b[0m -> From 10.1.2.166: Memory payload received ' + payload);
        }
    });

    // DB check

    MongoClient.connect(db_url, { useNewUrlParser: true }, async function(err, db){
        if (err) {
            console.log(err);
            console.log("\x1b[31mDatabase Error:\x1b[0m -> Database is offline.");
            return;
        }
        console.log("\x1b[35mDCA Setup\x1b[0m -> Database connected.");

        var temperature = db.db("temperature");
        temperature.createCollection(board_id.toString(), function(err, res) {
            if (err) throw err;
            console.log("\x1b[35mDCA Setup\x1b[0m -> Collection "+board_id.toString()+" created under Temperature.");
        });

        var history = db.db("history");

        await history.createCollection(board_id.toString(), function(err, res) {
            if (err) throw err;
            console.log("\x1b[35mDCA Setup\x1b[0m -> Collection "+board_id.toString()+" created under History.");
            db.close();
        }); 
    });

});

// Check for unconnected proxies. Will recall connect every 15 secs // TODO: comment this until beta test
// setInterval(() => {
//     for (board in unconnected) {
//         // console.log(board);
//         proxy[board].connect(Boarddata[board].port, Boarddata[board].IP);
//         delete unconnected[board];
//     }
// }, 15000);


// Command Server
const commandServer = net.createServer(function(socket){
    console.log('\x1b[32mCommandServer\x1b[0m -> Connected to web server.');
    socket.setEncoding("utf8");
    socket.on('data', function(data) {
        console.log('\x1b[32mCommandServer\x1b[0m -> Data Received: ' + data);
        var packet = JSON.parse(data);
        // console.log(packet);

        if(packet.opcode === BRD_RST) {
            var name = packet.param1;
            var id = packet.param2;
            console.log('\x1b[32mCommandServer\x1b[0m -> Reset Command on board: ' + name+'('+id+').');

            var buffer = Buffer.alloc(4);
            buffer.writeUInt32LE(3,0);
            console.log('DCA: Send packet:');
            console.log(buffer);

            if (!(name in Boarddata)) {
                socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+name+' is not in track list.'}));
                return;
            }
    
            if (Boarddata[name].ID !==id) {
                socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+id+' is not in record.'}));
                return;
            }
                
            if (name in unconnected) {
                socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+name+' is offline.'}));
                return;
            }

            var buffer = Buffer.alloc(4);
            buffer.writeUInt32LE(3,0);
            console.log('DCA: Send packet:');
            console.log(buffer);

            socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONSUCCESS}));
        }

        if(packet.opcode === BRD_MEM_R) {
            var name = packet.param1;
            var id = packet.param2;
            var address = package.param3;
            var byte = packet.param4;
            console.log('\x1b[32mCommandServer\x1b[0m -> Memory Read Command on board: ' + name+'('+id+') at '+address+' for '+byte+' bytes.');

            if (!(name in Boarddata)) {
                socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+name+' is not in track list.'}));
                return;
            }
    
            if (Boarddata[name].ID !==id) {
                socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+id+' is not in record.'}));
                return;
            }
                
            if (name in unconnected) {
                socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONFAILURE, err_msg: 'Board '+name+' is offline.'}));
                return;
            }

            socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONSUCCESS, address: address, byte: byte, content: "DEADBEEF"}));
    
            var buffer = Buffer.alloc(4);
            buffer.writeUInt32LE(3,0);
            console.log('DCA: Send packet:');
            console.log(buffer);
        }
    });
    socket.on('end', function(){
        console.log('\x1b[91mCommandServer\x1b[0m -> Disconnected from web server');
        socket.destroy();
    });
});

commandServer.listen(8013, '127.0.0.1');




// 

// Temperature Proxy

// TODO: Hard coding at this moment. Need to be updated to follow board_data.json
// After having valid list, use for loop here.
// proxy["Simulated"].connect(9527, '127.0.0.1', function(){
//     if (err) {
//         failedList["Simulated"] = proxy["Simulated"];
//         return;
//     }   
//     console.log('Connection Setup.');
//     proxy["Simulated"].setEncoding("utf8");
//     proxy["Simulated"].write('Ready');
// })

// proxy["Simulated"].on('error',function(res){
//     console.log('\x1b[34mProcess\x1b[0m -> Connection on ' + res.address + '/' + res.port + ' failed.')
//     console.log('\x1b[34mProcess\x1b[0m -> Code: ' + res.code);
// });

// proxy["Simulated"].on('data', function(data) {
//     console.log('\x1b[34mProcess\x1b[0m -> Data Received: ' + data);
//     // Connect Database
//     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db){
//         console.log("\x1b[34mProcess\x1b[0m -> Database connected.");

//         var temperature = db.db("temperature");

//         var timeStamp = moment().format("MMM Do YY, h:mm:ss a");
//         var obj = { temp: parseFloat(data), time: timeStamp };

//         temperature.collection("114514").insertOne(obj, function(err, res) {
//             if (err) throw err;
//             // console.log(res);
//             console.log("\x1b[34mProcess\x1b[0m -> Record: temp: "+obj.temp+" time: "+obj.time+" has added to database.");
//         });

//         // If overheated, trigger alert mail. (TODO: How to define threshold value here? At last structure diagram p_process should not talk to web server.)
//         if (parseFloat(data) >= 100) {
//             transporter.sendMail(mailOptions, function (err, info) {
//                 if(err)
//                     console.log(err) ;
//                 else
//                     console.log(info);
//             });
//             console.log('\x1b[34mProcess\x1b[0m -> Alert email sent. Temperature at the moment is' + data);
//         }

//         db.close();
//         console.log("\x1b[34mProcess\x1b[0m -> Database disconnected.");
//     });
// });

// proxy["Simulated"].on('close', function() {
//     console.log('\x1b[34mProcess\x1b[0m -> Target connection has closed.');
//     proxy["Simulated"].end();
// });


// ====================== board test ==========================

// proxy["Real_board"].connect(7, '10.1.2.180', function(){
//     // if (err) failedList.push(Boarddata[item]);
//     console.log('Connection Setup.');
//     const buffer = Buffer.from('01000000','hex');
//     // const testBuffer = Buffer.from('0200000096020000','hex');
//     const testBuffer = Buffer.alloc(12);
//     testBuffer.writeUInt32LE("0x9",0)
//     testBuffer.writeUInt32LE("0x90003000",4);
//     testBuffer.writeUInt32LE(12,8);
//     // var command = '09';
//     // var buffer = Buffer.
//     console.log(testBuffer[0]);
//     var temp = Buffer.from(testBuffer.toString('hex',4,8));
//     console.log(testBuffer);
//     proxy["Real_board"].write(testBuffer);


//     const buffer1 = Buffer.from('0c0000000010009004000000efbeadde','hex'); // Write mem to 0x90001000, 0xdeadbeef
//     // const buffer1 = Buffer.from('0c000000 003000900400000078563412','hex'); // Write mem to 0x90003000, 0x12345678
//     // const buffer2 = Buffer.from('0c000000 003000400400000078563412','hex'); // Write mem to 0x40003000, 0x12345678
//     const buffer2 = Buffer.from('090000000030009004000000','hex');  // Read from 0x90003000

//     // console.log("\x1b[34mProcess\x1b[0m -> Packet sent:");
//     // console.log(buffer1);
//     // console.log("\x1b[34mProcess\x1b[0m -> Packet sent:");
//     // console.log(buffer2);
//     // proxy["Real_board"].write(buffer1);
//     // proxy["Real_board"].write(buffer2);

//     // setInterval(() => {
//     //     proxy["Real_board"].write(buffer);
//     // }, 1000);
// })


// proxy["Real_board"].on('close', function() {
//     console.log('\x1b[34mProcess\x1b[0m -> Target 10.1.2.166 connection has closed.');
//     proxy.end();
// });

// proxy["Real_board"].on('data', function(data) {
//     console.log('\x1b[34mProcess\x1b[0m -> From 10.1.2.166: data received.');
//     var buffer = Buffer.from(data);
//     console.log(buffer);

//     if (buffer[0] == RESP_TEMP){
//         // console.log(buffer.readInt32LE(4));
//         var converted_temp = buffer.readInt32LE(4) * 501.3743 / 1024 - 273.6777;
//         console.log('\x1b[34mProcess\x1b[0m -> From 10.1.2.166: Temperature received ' + converted_temp);
//         var timeStamp = moment().format("MMM Do YY, h:mm:ss a");
//         var obj = { temp: converted_temp, time: timeStamp };

//     }

//     if (buffer[0] == MEM_R_ACK){
//         // int32 has 4 byte alignment. Check first.
//         var payload_len = buffer.length - 4;

//         console.log('\x1b[34mProcess\x1b[0m -> From 10.1.2.166: Memory reading packet received. Length: ' + payload_len);

//         var payload_len_tail = payload_len % 4;
//         // var payload_len_aligned = payload_len - payload_len_tail;
//         if (payload_len_tail) {
//             console.log('\x1b[34mProcess\x1b[0m -> From 10.1.2.166: \x1b[31mERROR!\x1b[0m Payload is unaligned.');
//             return;
//         }

//         var i;
//         var payload = '';
//         for (i = 0; i < payload_len; i+= 4) {
//             payload += buffer.readUInt32LE(4+i).toString(16);
//             payload += ' ';
//         }

//         // LOL: unalignment makes no sense for little endian. We need to check input, but not handle unalignment.
//         // Keep these codes just in case.

//         // if (payload_len_tail) {
//         //     switch(payload_len_tail) {
//         //         case 1: 
//         //             payload += buffer.readUInt8(payload_len_aligned + 4).toString(16);
//         //             break;

//         //         case 2: 
//         //             payload += buffer.readUInt16LE(payload_len_aligned + 4).toString(16);
//         //             break;

//         //         case 3:
//         //             payload += buffer.readUInt32LE(payload_len_aligned + 4).toString(16);
//         //             break;
//         //     }
//         // }
//         // console.log(payload);
//         console.log('\x1b[34mProcess\x1b[0m -> From 10.1.2.166: Memory payload received ' + payload);
//     }
// });
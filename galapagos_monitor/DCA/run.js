// Filesys 
const fs = require('fs');

// Global vars
var Boarddata = JSON.parse(fs.readFileSync('board_data.json', 'utf8'));
var BoardNames = [];
var proxy = {};
var timer = {};
var email_event_flag = {};
var email_cap = 90;
var unconnected = {};
var web_server_socket;
for (item in Boarddata) {
    BoardNames.push(item);
    email_event_flag[item] = 0;
} // Used for proxy setup. AddEventListener will be skewed up if using for .. in since function is async, thus we have to use forEach.

// Socket Setup
const net = require('net');

// MongoDB Setup
const MongoClient = require('mongodb').MongoClient;

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

// Command Opcode
const BRD_RST = 1;
const BRD_THR = 2;
const BRD_MEM_R = 3;
const BRD_MEM_W = 4;
const SET_ALRT_CAP = 5;

// Config
const config = require('config');

// Mail Notifier
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'GalapagosMonitor@gmail.com',
        pass: 'Galapagos496'
    }
});

var mailOptions = {
    from: 'GalapagosMonitor@address.com', 
    to: config.get('DCA.alert mail.receiver'),  
    subject: config.get('DCA.alert mail.subject')
};

// =============================== Setup Start ==================================

// Proxy 
BoardNames.forEach(function(board){
    // console.log(board);
    var board_id = Boarddata[board].ID;

    proxy[board] = new net.Socket();
    proxy[board].setTimeout(config.get('DCA.proxy.timeout'));

    // First Connection

    proxy[board].on('connect', function(err){
        if (err) { 
            console.log(err);
            return;
        }

        if (board in unconnected)
            delete unconnected[board];
            
        console.log('\x1b[32mProxy Connect\x1b[0m -> Board ' + board + ' Connection Setup on '+ Boarddata[board].IP +'/'+Boarddata[board].port+'.');

        timer[board] = setInterval(() => {
            const buffer = Buffer.alloc(8);
            buffer.write('00000000',0,4,'hex');
            buffer.writeUInt32LE(REQ_TEMP,4)
            proxy[board].write(buffer);
            console.log("Temp Request sent to board %s.",board);
        }, config.get('DCA.proxy.temperature update interval')); 

    });

    // Event Handler
    proxy[board].on('timeout', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' timeout and is disconnecting.');
        unconnected[board] = 1;
        proxy[board].end();
    });

    proxy[board].on('close', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection has closed.');
        clearInterval(timer[board]);
        unconnected[board] = 1;
    });

    proxy[board].on('end', () => {
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection has ended.');
    });

    proxy[board].on('error',(res) =>{
        console.log('\x1b[31mProxy Error\x1b[0m -> Board ' + board + ' connection met error. Error Code: ' + res.code);
        unconnected[board] = 1;
    });

    proxy[board].on('data', (data) => {
        
        var buffer = Buffer.from(data);
        var client_id = buffer.toString('hex',0,4);

        console.log('\x1b[32mProxy Packet\x1b[0m -> From board %s: data received.', board);

        buffer = buffer.slice(4);
    
        if (buffer[0] == RESP_TEMP){
            var converted_temp = buffer.readInt32LE(4) * 503.975 / 4096 - 273.15;
            console.log('\x1b[32mProxy Packet\x1b[0m -> From board %s: Temperature received : %f.', board, converted_temp);
            var timeStamp = moment().format("YYYY MM DD, HH:mm:ss");
            var obj = { temp: converted_temp, time: timeStamp };

            // If overheated, trigger alert mail.
            var timeStamp_mail = moment().format("MMM Do YYYY, h:mm:ss a");
            if (converted_temp >= email_cap) {
                if (!email_event_flag[board]) {
                    console.log('\x1b[91mProcess\x1b[0m -> Alert email sent. Temperature at the moment is %f.\n', converted_temp);
                    mailOptions.text = "Alert: Board " + board
                        + "(" + board_id + ") is over set alert cap " + email_cap
                        + " at " + timeStamp_mail
                        + ". Temperature at the moment: " + converted_temp + ".\n";
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err)
                            console.log(err);
                        else
                            console.log(info);
                    });
                    email_event_flag[board] = 1;
                }
            } else email_event_flag[board] = 0;
            
            // Add temperature to db
            dbWrite("temperature", board_id.toString(), obj);
        }
    
        if (buffer[0] == MEM_R_ACK){
            // int32 has 4 byte alignment. Check first.
            var payload_len = buffer.length - 4;
            
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Memory read packet received. Length: %d. To Client: %s', board, payload_len, client_id);
    
            var payload_len_tail = payload_len % 4;
            var payload_len_aligned = payload_len - payload_len_tail;
            if (payload_len_tail) {
                console.log('\x1b[91mProxy Packet Error\x1b[0m -> From %s: \x1b[31mERROR!\x1b[0m Payload is unaligned.\n', board);
                return;
            }

            // TODO: we really need to check alignment or not?
    
            var i;
            var payload = '';
            for (i = 0; i < payload_len; i+= 4) {
                payload += buffer.readUInt32LE(4+i).toString(16).padStart(8,'0');
                payload += ' ';
            }

            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Memory payload received ' + payload + '.\n', board);

            web_server_socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: board, id: Boarddata[board].ID, return: ONSUCCESS, content: payload, client_id: client_id}));

        }

        if (buffer[0] == MEM_R_UACK){
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Memory read unacknowledge received.\n', board);

            var err_msg = "DCA received unacknowledge flag. User might not have privilege to input address.";

            web_server_socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: board, id: Boarddata[board].ID, return: ONFAILURE, client_id: client_id, err_msg: err_msg}));

        }

        if (buffer[0] == MEM_W_ACK){
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Memory write acknowledge received.\n', board);

            web_server_socket.write(JSON.stringify({ opcode: BRD_MEM_W, name: board, id: Boarddata[board].ID, return: ONSUCCESS, client_id: client_id}));

        }

        if (buffer[0] == MEM_W_UACK){
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Memory write unacknowledge received.\n', board);

            var err_msg = "DCA received unacknowledge flag. User might not have privilege to input address.";

            web_server_socket.write(JSON.stringify({ opcode: BRD_MEM_W, name: board, id: Boarddata[board].ID, return: ONFAILURE, client_id: client_id, err_msg: err_msg}));

        }

        if (buffer[0] == THR_ACK){
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Set threshold acknowledge received.\n', board);

            web_server_socket.write(JSON.stringify({ opcode: BRD_THR, name: board, id: Boarddata[board].ID, return: ONSUCCESS, client_id: client_id}));

        }

        if (buffer[0] == THR_UACK){
            console.log('\x1b[32mProxy Packet\x1b[0m -> From %s: Set threshold unacknowledge received.\n', board);

            var err_msg = "DCA received unacknowledge flag. Check your input.";

            web_server_socket.write(JSON.stringify({ opcode: BRD_THR, name: board, id: Boarddata[board].ID, return: ONFAILURE, client_id: client_id, err_msg: err_msg}));

        }
    });

    // TODO: may have timing issue: What if DB Setup is not done before this line?
    proxy[board].connect(Boarddata[board].port, Boarddata[board].IP);

});

// =============================== Setup End ==================================

// Check for unconnected proxies. Will recall connect every XX secs 
setInterval(() => {
    for (board in unconnected) {
        console.log("Reconnecting :" + board);
        delete unconnected[board];
        proxy[board].connect(Boarddata[board].port, Boarddata[board].IP);
    }
}, config.get('DCA.proxy.reconnection interval'));  


// Command Server
const commandServer = net.createServer(function(socket){
    console.log('\x1b[33mCommandServer\x1b[0m -> Connected to a new web server client.');

    web_server_socket = socket;

    socket.setEncoding("utf8");
    socket.on('data', function(data) {
        console.log('\x1b[33mCommandServer\x1b[0m -> Data Received: ' + data);
        var packet = JSON.parse(data);
        var client_id = packet.client_id;
        // console.log(packet);

        var timeStamp = moment().format("YYYY MM DD, HH:mm:ss");

        if(packet.opcode === BRD_RST) {
            var name = packet.param1;
            var id = packet.param2;
            console.log('\x1b[33mCommandServer\x1b[0m -> Reset Command on board: %s(%d).', name, id);

            var err_msg = checkInvalidCommand(name, id);
            if (err_msg) {
                socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONFAILURE, err_msg: err_msg, client_id: client_id }));
                return;
            }

            // TODO: from ip address is better? Take a look how to get ip from socket
            var log = { opcode: BRD_RST, board_name: name, board_id: id, from: client_id, time: timeStamp };
            dbWrite('history', 'general', log);

            var buffer = Buffer.alloc(8);
            buffer.write(client_id, 0, 4, 'hex');
            buffer.writeUInt32LE(RST_CMD,4);
            console.log('DCA: Send packet:');
            console.log(buffer);
            proxy[name].write(buffer);

            // proxy[name].end(); // Design Fair Checklist: Container Limited Ver.

            socket.write(JSON.stringify({ opcode: BRD_RST, name: name, id: id, return: ONSUCCESS, client_id: client_id}));
        }

        if(packet.opcode === BRD_MEM_R) {
            var name = packet.param1;
            var id = packet.param2;
            var address = packet.param3;
            var byte = packet.param4;
            console.log('\x1b[33mCommandServer\x1b[0m -> Memory Read Command on board: %s(%d) at %s for %d bytes', name, id, address, byte);

            var err_msg = checkInvalidCommand(name, id);
            if (err_msg) {
                socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONFAILURE, err_msg: err_msg, client_id: client_id }));
                return;
            }
            // socket.write(JSON.stringify({ opcode: BRD_MEM_R, name: name, id: id, return: ONSUCCESS, address: address, byte: byte, content: "DEADBEEF"}));
            var log = { opcode: BRD_RST, board_name: name, board_id: id, from: client_id, time: timeStamp, address: address, byte: byte };
            dbWrite('history', 'general', log);

            var buffer = Buffer.alloc(16);
            buffer.write(client_id, 0, 4, 'hex');
            buffer.writeUInt32LE(MEM_R,4)
            buffer.writeUInt32LE(address,8);
            buffer.writeUInt32LE(byte,12);
            console.log('DCA: Send packet:');
            console.log(buffer);

            proxy[name].write(buffer);
        }

        if(packet.opcode === BRD_MEM_W) {
            var name = packet.param1;
            var id = packet.param2;
            var address = packet.param3;
            var byte = packet.param4;
            var value = packet.param5;
            console.log('\x1b[33mCommandServer\x1b[0m -> Memory Write Command on board: %s(%d) at %s for %d bytes. Value: %s.', name, id, address, byte, value);

            var err_msg = checkInvalidCommand(name, id);
            if (err_msg) {
                socket.write(JSON.stringify({ opcode: BRD_MEM_W, name: name, id: id, return: ONFAILURE, err_msg: err_msg, client_id: client_id }));
                return;
            }
            // socket.write(JSON.stringify({ opcode: BRD_MEM_W, name: name, id: id, return: ONSUCCESS, address: address, byte: byte, content: "DEADBEEF"}));
            var log = { opcode: BRD_RST, board_name: name, board_id: id, from: client_id, time: timeStamp, address: address, byte: byte, value: value };
            dbWrite('history', 'general', log);

            var buffer_len = byte + 16;

            var buffer = Buffer.alloc(buffer_len);
            buffer.write(client_id, 0, 4, 'hex');
            buffer.writeUInt32LE(MEM_W,4)
            buffer.writeUInt32LE(address,8);
            buffer.writeUInt32LE(byte,12);

            for (i = 0; i < buffer_len - 16; i+= 4) {
                var writeVal = '0x' + value.substring(i*2, (i+4)*2);
                buffer.writeUInt32LE(writeVal.toString('hex'), 16+i);
            }

            console.log('DCA: Send packet:');
            console.log(buffer);

            proxy[name].write(buffer);
        }

        if(packet.opcode === BRD_THR) {
            var name = packet.param1;
            var id = packet.param2;
            var threshold = packet.param3;
            console.log('\x1b[33mCommandServer\x1b[0m -> Set Reset Threshold Command on board: %s(%d). Threshold value: %d.', name, id, threshold);

            var err_msg = checkInvalidCommand(name, id);
            if (err_msg) {
                socket.write(JSON.stringify({ opcode: BRD_THR, name: name, id: id, return: ONFAILURE, err_msg: err_msg, client_id: client_id }));
                return;
            }

            var log = { opcode: BRD_RST, board_name: name, board_id: id, from: client_id, time: timeStamp, threshold: threshold };
            dbWrite('history', 'general', log);

            var buffer = Buffer.alloc(12);
            buffer.write(client_id, 0, 4, 'hex');
            buffer.writeUInt32LE(THR_CMD,4);
            buffer.writeUInt32LE(threshold,8);
            console.log('DCA: Send packet:');
            console.log(buffer);
            proxy[name].write(buffer);
        }

        // This command does not interact with board. Only mail alert cap is changed. 
        if (packet.opcode === SET_ALRT_CAP) {
            var name = packet.param1;
            var id = packet.param2;
            var cap = packet.param3;
            console.log('\x1b[33mCommandServer\x1b[0m -> Set Warning Cap Command on board: %s(%d). Cap value: %d.', name, id, cap);

            var err_msg = checkInvalidCommand(name, id);
            if (err_msg) {
                socket.write(JSON.stringify({ opcode: SET_ALRT_CAP, name: name, id: id, return: ONFAILURE, err_msg: err_msg, client_id: client_id }));
                return;
            }

            email_cap = (cap > 50) ? cap : 50;
            var log = { opcode: SET_ALRT_CAP, board_name: name, board_id: id, from: client_id, time: timeStamp, alert_cap: cap };
            dbWrite('history', 'general', log);
        }
    });

    socket.on('error', function (err) {
        console.log('\x1b[91mCommandServer\x1b[0m -> Received error %s from web server client.', err.code);
    });

    socket.on('close', function(){
        console.log('\x1b[91mCommandServer\x1b[0m -> Disconnected from web server client.');
        socket.destroy();
    });
});

commandServer.listen(config.get('command server.port'), config.get('command server.host'));


function dbWrite(dbName, collection, obj){
    // Connect Database
    MongoClient.connect(config.get('database.url'), { useNewUrlParser: true }, function (err, db) {
        if (err) {
            console.log("\x1b[31mProcess:\x1b[0m Error: Occured when connecting database.\n");
            console.log(err);
            return;
        }
        // console.log("\x1b[34mProcess\x1b[0m -> Database connected.");

        var DB = db.db(dbName); // TODO: invalid input checking

        DB.collection(collection).insertOne(obj, function (err, res) {
            if (err) {
                console.log("\x1b[31mProcess:\x1b[0m Error: Occured when connecting collection %s under db %s.\n", collection, dbName);
                console.log(err);
                return;
            }
            console.log("\x1b[34mProcess\x1b[0m -> Record: %s has added to collection %d under %s database.\n", JSON.stringify(obj), collection, dbName);
        });

        db.close();
        // console.log("\x1b[34mProcess\x1b[0m -> Database disconnected.");
    });
}

function checkInvalidCommand(name, id) {
    var err_msg = undefined;
    if (!(name in Boarddata)) {
        err_msg = 'Board ' + name + ' is not in track list.';
    }

    if (Boarddata[name].ID !== id) {
        err_msg = 'Board ' + id + ' is not in record.';
    }

    if (name in unconnected) {
        err_msg = 'Board ' + name + ' is offline.';
    }

    return err_msg;
}
'use strict';

const net = require('net');
const event = require('events');
const eventEmitter = new event.EventEmitter();

const host = process.argv[2];
const port = process.argv[3];
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });
// console.log(host);
// console.log(port);


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

// temp 
var variance = 1;
var temp = 75;

const server = net.createServer(function(socket){
    console.log('\x1b[31mSimulated Board\x1b[0m -> DCA has awaken!');
    socket.on('data', function(data) {
        var buffer = Buffer.from(data);
        buffer = buffer.slice(4);
        if (buffer[0] == REQ_TEMP){
            console.log('\x1b[31mSimulated Board\x1b[0m -> Receive temperature request. Send temp: '+ temp +' back.');
            var translated_temp = (temp + 273.15) / 503.975 * 4096;
            const respose = Buffer.alloc(12);
            respose.writeUInt16LE("0x2",4);
            respose.writeUInt16LE(translated_temp,8);
            socket.write(respose);
            temp += variance;
            if (temp < 60 || temp > 90) variance *= -1;
        }
    });
    socket.on('end', function(){
        console.log('\x1b[31mSimulated Board\x1b[0m -> DCA has disconnected');
        socket.destroy();
    });
});

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve,ms))
}

// const sim_temperature_emitter = async function(socket) {
//     console.log('\x1b[31mBoard\x1b[0m -> Temperature start sending to process.');
//     var variance = 1;
//     var temp = 75;
//     while(!socket.destroyed) {
//         socket.write(temp.toString());
//         temp += variance;
//         if (temp < 60 || temp > 90) variance *= -1;
//         await sleep(1000);
//     }
//     console.log('\x1b[31mBoard\x1b[0m -> Connection closed.');
// }

server.listen(port, host);
console.log('\x1b[31mSimulated Board\x1b[0m -> Start listening '+host +'/' + port);

// eventEmitter.on('start', sim_temperature_emitter);

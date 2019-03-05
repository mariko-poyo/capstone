const net = require('net');
const event = require('events');
const eventEmitter = new event.EventEmitter();

const server = net.createServer(function(socket){
    socket.setEncoding("utf8");
    socket.on('data', function(data) {
        console.log('\x1b[31mBoard\x1b[0m -> Data Received: ' + data);
        if (data == 'Ready') {
            console.log('\x1b[31mBoard\x1b[0m -> P_process has awaken!');
            eventEmitter.emit('start', socket);
        }
    });
    socket.on('end', socket.destroy);
});

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve,ms))
}

const sim_temperature_emitter = async function(socket) {
    console.log('\x1b[31mBoard\x1b[0m -> Temperature start sending to process.');
    var variance = 1;
    var temp = 75;
    while(!socket.destroyed) {
        socket.write(temp.toString());
        temp += variance;
        if (temp < 60 || temp > 90) variance *= -1;
        await sleep(1000);
    }
    console.log('\x1b[31mBoard\x1b[0m -> Connection closed.');
}

server.listen(9527, '127.0.0.1');

eventEmitter.on('start', sim_temperature_emitter);

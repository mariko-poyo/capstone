var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const { fork } = require('child_process');

app.get('/', function(req, res){
 	res.sendFile(__dirname + '/index.html');
});

//new connection
io.on('connection', function(socket){
	console.log('new connection established');

	socket.on('add board', function(ip){
		console.log('add board with ip address of '+ ip);

		//spawn child for querying to ip address continuously
		const process = fork('./inter_client.js');
		process.send(ip);

		//process data on reply from child proc
		process.on('message', (data) => {
			io.emit('temp val update', {board_num: ip, temperatureval: data});
		});
	});
});

//send random value all the time
setInterval(function() {
  	var temperature_tmp = Math.floor(Math.random() * 1000);
    io.emit('temp val update', {board_num: 1, temperatureval: temperature_tmp});
}, 1000);

http.listen(3000, function(){
  console.log('listening on *:3000');
});


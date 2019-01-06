const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { fork } = require('child_process');

const express = require('express');
const app = express();

const APP_PORT= 5556; //tmp -> change it to some other port if ELIFECYCLE error appears
const server = app.listen(APP_PORT, ()=> {
	console.log('app running in port ' + APP_PORT);
});

var io = require('socket.io').listen(app.listen(server));

// const getApiAndEmit = "TODO" // Fill later

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/static',express.static(path.join(__dirname, 'public/javascripts')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//
// let interval;
//
// // The connection event returns a socket object which will be passed to the callback function.
// io.on('connection', function (socket) {
//     console.log("New client connected");
//     if (interval) {
//         clearInterval(interval);
//     }
//     interval = setInterval(() => getApiAndEmit(socket), 10000);
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//     });
// });

let interval;

let childprocesses = [];
// at beginning everything should be 0, now we only have 3 boards
// and I am lazy so let's have 4 zeros
let childcounts = [0,0,0,0];
//new connection
io.on('connection', function(socket){
  console.log("New client connected");
  var boards = [];
  if (interval){
    clearInterval(interval);
  }

  socket.on('add board', function(config){
    var board_num = config.num;
	// board_num looks like board_1
	var board_id = parseInt(board_num.split("_")[1], 10);
    console.log('add board with id ' + board_id + ' and with ip address of '+ config.IP);
	boards.push(board_id);
	if(childcounts[board_id] == 0)
	{
      //spawn child for querying to ip address continuously
      childprocesses[board_id] = fork('./inter_client.js');
      childprocesses[board_id].send(config);
	}
	childcounts[board_id]++;
    //process data on reply from child proc
    childprocesses[config.id].on('message', (data) => {
      io.emit('temp val update', {id: board_id,board_num: board_num, temperatureval: data});
    });

	// Temprorarily there is an issue. when multiple socket own the same
	// subprocess, although only one subprocess will close but all socket will
	// print out the message, making the thing very confusing.
	childprocesses[board_id].on('close', (code) => {
		console.log("Sub process killed, board id is " + board_id);
	});

	// I have no idea whther this is the correct implemenation or not.
	// simple leave it here as reminder that we need to implement it
	//childprocesses[config.id].on('error', (error) => {
	//	console.log(error);
    //});


  });

  // This happens when broswer disconnet from server
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    boards.forEach(function(value){
	  childcounts[value]--;
	  if(childcounts[value] == 0){
        console.log('killing child process listening on board id ' + value);
        childprocesses[value].kill();
	  }
    });
  });
});

//send random value all the time
setInterval(function() {
  var temperature_tmp = Math.floor(Math.random() * 1000);
  io.emit('temp val update', {id: 0, board_num: 0, temperatureval: temperature_tmp});
}, 1000);


module.exports = app;

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { fork } = require('child_process');

const express = require('express');
const app = express();

const APP_PORT= 5555; //tmp
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

//new connection
io.on('connection', function(socket){
  console.log("New client connected");

  if (interval){
    clearInterval(interval);
  }

  socket.on('add board', function(config){
    var board_num = config.num;
    console.log('add board with ip address of '+ config.IP);

    //spawn child for querying to ip address continuously
    const process = fork('./inter_client.js');
    process.send(config);

    //process data on reply from child proc
    process.on('message', (data) => {
      io.emit('temp val update', {board_num: board_num, temperatureval: data});
    });

    socket.on("disconnect", () => console.log("Client disconnected"));
  });
});

//send random value all the time
setInterval(function() {
  var temperature_tmp = Math.floor(Math.random() * 1000);
  io.emit('temp val update', {board_num: 1, temperatureval: temperature_tmp});
}, 1000);


module.exports = app;

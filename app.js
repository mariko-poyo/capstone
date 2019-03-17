const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const fs = require('fs');

const express = require('express');
const app = express();

const APP_PORT= 5557; //tmp -> change it to some other port if ELIFECYCLE error appears
const server = app.listen(APP_PORT, (err)=> {
    if (err) console.log('App failed to listen port ' + APP_PORT);
	console.log('App is listening port ' + APP_PORT);
});


// socket.io setup

var io = require('socket.io').listen(server);

// database access interval
var updateInterval = 1000;

// MongoDB setup

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';

// Some Bootup loading
var Boarddata = JSON.parse(fs.readFileSync('board_data.json', 'utf8'));
console.log(Boarddata);

// Other Plugins
const moment = require('moment');
const warningNotify = require('node-notifier');

// Setup http handler
app.get('/getBoards',function(req,res){
    console.log("receive http request");
    res.send(Boarddata);
    res.end();
});

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

//new connection
io.on('connection', function(socket){
    console.log("New client connected");

    // Receive request from client. TODO: consider large scale connection in the future.
    socket.on('request', (ID) => {
        console.log("\x1b[34mio.connection:\x1b[0m Request received from board ID:" + ID);
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db){
            if (err) {
                console.log("\x1b[34mio.connection:\x1b[0m Error: Database is offline!");
                return;
                // throw err;
            }
            
            console.log("\x1b[34mio.connection:\x1b[0m Database connected.");
    
            var temperature = db.db("temperature");
    
            obj = temperature.collection(ID.toString()).find().sort({"time": -1}).limit(1).toArray(function(err, result){
                if (err) throw err;
                // console.log(result);
                if (result.length == 0) {
                    console.log("\x1b[34mio.connection:\x1b[0m Error: Database is empty for board ID:"+ID+".");
                    db.close();
                    console.log("\x1b[34mio.connection:\x1b[0m Database disconnected.\n");
                } else {
                    io.emit('temperature update', {id: ID, time: result[0].time, temperature: result[0].temp});
                    console.log("\x1b[34mio.connection:\x1b[0m Result: time - " + result[0].time + ", temperature - " + result[0].temp + "sent.");
                    db.close();
                    console.log("\x1b[34mio.connection:\x1b[0m Database disconnected.\n");
                }
            });
        });
    });

    socket.on('dashboard', (trackingList) => {
        console.log("\x1b[34mio.connection:\x1b[0m Dashboard update request received.");
        console.log(trackingList);
        MongoClient.connect(url, { useNewUrlParser: true },async function(err, db){
            if (err) {
                console.log("\x1b[34mio.connection:\x1b[0m Error: Database is offline!");
                return;
                // throw err;
            }
            
            console.log("\x1b[34mio.connection:\x1b[0m Database connected.");
    
            var temperature = db.db("temperature");

            var ret = {};

            for (var item in trackingList) {
                // console.log(item);
                let promise = new Promise(function(resolve, reject) {
                    var id = trackingList[item].ID;
                    obj = temperature.collection(id.toString()).find().sort({"time": -1}).limit(1).toArray(function(err, result){
                        if (err) console.log(err);
                        // console.log(result);
                        if (result.length == 0) {
                            // ret[item] = undefined;
                            ret[item] = 19;
                            console.log("\x1b[33mDashboard Update:\x1b[0m Error: Database is empty for board ID:"+item.ID+".");
                        } else {
                            ret[item] = result[0].temp;
                            console.log("\x1b[33mDashboard Update:\x1b[0m Insert: " + "temperature - " + result[0].temp + " to ret.");
                        }
                        resolve("Lookup end"); // should not reject.
                    });
                });

                console.log("\x1b[33mDashboard Update:\x1b[0m Wait for promise.");
                await promise; 
                console.log("\x1b[33mDashboard Update:\x1b[0m promise end.");
            }

            console.log("\x1b[33mDashboard Update:\x1b[0m Send ret to frontend.");
            console.log(ret);
            io.emit('dashboard update', ret);

            db.close();
            console.log("\x1b[33mDashboard Update:\x1b[0m Database disconnected.\n");
            
        });

    });

    // This happens when broswer disconnet from server
    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

let interval;
//send random value all the time
interval = setInterval(function() {
    var temperature_tmp = 800;
    if (temperature_tmp >= 900) {
        console.log('Notifier triggered.');
        warningNotify.notify({
                title: 'Galapagos Monitor Temperature Warning:',
                message: 'Board 0\'s temperature has reached ' + temperature_tmp.toString() + ' !',
                sound: true,
                wait: true
            },
            function (err, response) {
                // Response is response from notification
            });
    }
    

}, updateInterval);

module.exports = app;

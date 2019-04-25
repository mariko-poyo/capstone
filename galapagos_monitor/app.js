// Const
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const historyRouter = require('./routes/history')

const fs = require('fs');
var hash = require('object-hash');

const express = require('express');
const app = express();
const net = require('net');
const commandProxy = new net.Socket();

var DCAStatus = 0; // DCA Online Flag

const config = require('config');

const APP_PORT= 5557; //tmp -> change it to some other port if ELIFECYCLE error appears
const server = app.listen(APP_PORT, (err)=> {
    if (err) console.log('App failed to listen port ' + APP_PORT);
	console.log('App is listening port ' + APP_PORT);
});


// socket.io setup
var io = require('socket.io').listen(server);

// MongoDB setup
const MongoClient = require('mongodb').MongoClient;

// Some Bootup loading
var Boarddata = JSON.parse(fs.readFileSync('board_data.json', 'utf8'));
console.log(Boarddata);

// Other Plugins
const moment = require('moment');
const warningNotify = require('node-notifier');

// Command Status Code
const ONSUCCESS = 1;
const ONFAILURE = 2;

// Command  Opcode
const BRD_RST = 1;
const BRD_THR = 2;
const BRD_MEM_R = 3;
const BRD_MEM_W = 4;
const SET_ALRT_CAP = 5;

// Client socket table
var client_table = {};

// Setup http handler
app.get('/getBoards',function(req,res){
    console.log("Received http request: GetBoardInfo.");
    res.send(Boarddata);
    res.end();
});

app.get('/getHistory',function(req,res){
    console.log("Receive http request: GetRecentHistory.");
    MongoClient.connect(config.get('database.url'), { useNewUrlParser: true }, function (err, db) {
        if (err) {
            console.log("\x1b[34mHistory Table:\x1b[0m Error: Occured when connecting database.");
            console.log(err);
            return;
        }

        var history = db.db("history");

        obj = history.collection('general').find().sort({ "time": -1 }).limit(20).toArray(function (err, result) {
            if (err) {
                console.log("\x1b[31mHistory Table:\x1b[0m Error: Occured when connecting collection.");
                console.log(err);
                return;
            }

            res.send(result);
            res.end();
        });
    });
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
app.use('/history', historyRouter);

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
    var client_hash = hash.MD5(socket);
    var client_id = client_hash.substring(0,8);

    if (client_id in client_table) throw "Oh-oh, you won the jackpot: Duplicated client id from truncated MD5. Congrats!";

    console.log("New client connected. Hash: %s. ID: %s.", client_hash, client_id);

    client_table[client_id] = socket;

    // Receive request from client.
    socket.on('request', (ID) => {
        console.log("\x1b[92mTemperature Update:\x1b[0m Request received from clinet ID: %s on board id: %s.", client_id, ID);
        MongoClient.connect(config.get('database.url'), { useNewUrlParser: true }, function(err, db){
            if (err) {
                console.log("\x1b[34mTemperature Update:\x1b[0m Error: Occured when connecting database.");
                console.log(err);
                return;
                // throw err;
            }
            
            // console.log("\x1b[34mTemperature Update:\x1b[0m Database connected.");
    
            var temperature = db.db("temperature");
    
            obj = temperature.collection(ID.toString()).find().sort({"time": -1}).limit(1).toArray(function(err, result){
                if (err) {
                    console.log("\x1b[31mTemperature Update:\x1b[0m Error: Occured when connecting collection.");
                    console.log(err);
                    return;
                    // throw err;
                }

                // console.log(result);
                if (result.length === 0) {
                    console.log("\x1b[31mTemperature Update:\x1b[0m Error: Database is empty for board ID:"+ID+".");
                    db.close();
                    console.log("\x1b[31mTemperature Update:\x1b[0m Database disconnected.\n");
                } else {
                    if (result[0].temp >= 90) {
                        console.log('Notifier triggered.');
                        warningNotify.notify({
                            title: 'Galapagos Monitor Temperature Warning:',
                            message: 'Board '+ID+'\'s temperature has reached ' + result[0].temp.toString() + ' !',
                            sound: true,
                            wait: true
                        },
                        function (err, response) {
                            // Response is response from notification
                        });
                    }
                    socket.emit('temperature update', {id: ID, time: result[0].time, temperature: result[0].temp});
                    console.log("\x1b[92mTemperature Update:\x1b[0m Result: time - %s, temperature - %f sent.\n", result[0].time, result[0].temp);
                    db.close();
                    // console.log("\x1b[34mTemperature Update:\x1b[0m Database disconnected.\n");
                }
            });
        });
    });

    socket.on('dashboard', (trackingList) => {
        console.log("\x1b[33mDashboard Update:\x1b[0m Dashboard update request received.");
        // console.log(trackingList);
        MongoClient.connect(config.get('database.url'), { useNewUrlParser: true },async function(err, db){
            if (err) {
                console.log("\x1b[31mDashboard Update:\x1b[0m Error: Occured when connecting database.");
                console.log(err);
                return;
                // throw err;
            }
            
            // console.log("\x1b[34mio.connection:\x1b[0m Database connected.");
    
            var temperature = db.db("temperature");

            var ret = {};

            for (var item in trackingList) {
                // console.log(item);
                let promise = new Promise(function(resolve, reject) {
                    var id = trackingList[item];
                    obj = temperature.collection(id.toString()).find().sort({"time": -1}).limit(1).toArray(function(err, result){
                        if (err) {
                            console.log("\x1b[34mio.connection:\x1b[0m Error: Occured when connecting collection.");
                            console.log(err);
                            reject("DB Error");
                            // throw err;
                        }
                        // console.log(result);
                        if (result.length === 0) {
                            ret[item] = [undefined, undefined];
                            console.log("\x1b[33mDashboard Update:\x1b[0m Error: Database is empty for board ID:"+id+".");
                        } else {
                            ret[item] = [result[0].temp, result[0].time];
                            // console.log("\x1b[33mDashboard Update:\x1b[0m Insert: " + "temperature - " + result[0].temp + " to ret.");
                        }
                        resolve("Lookup end"); 
                    });
                });

                // console.log("\x1b[33mDashboard Update:\x1b[0m Wait for promise.");
                await promise; 
                // console.log("\x1b[33mDashboard Update:\x1b[0m promise end.");
            }

            console.log("\x1b[33mDashboard Update:\x1b[0m Send %s to frontend. \n", JSON.stringify(ret));
            // console.log(ret);
            socket.emit('dashboard update', ret);

            db.close();
            // console.log("\x1b[33mDashboard Update:\x1b[0m Database disconnected.\n");
        });

    });

    // User Command
    socket.on('reset', (name, ID) => {
        console.log("\x1b[34mUser Command:\x1b[0m Reset command received from board "+ name + ': '+ ID);
        if(DCAStatus) {
            commandProxy.write(JSON.stringify({ opcode: BRD_RST, param1: name, param2: ID, client_id: client_id }));
        } else {
            socket.emit('reset return', {name: name, ID: ID, status: ONFAILURE, err_msg: "DCA is offline."});
        }
    });

    socket.on('mem read', (name, ID, addr, byte) => {
        console.log("\x1b[34mUser Command:\x1b[0m Memory read command received from board %s:%d for %d bytes at %s\n", name, ID, byte, addr);
        if (DCAStatus) {
            commandProxy.write(JSON.stringify({ opcode: BRD_MEM_R, param1: name, param2: ID, param3: addr, param4: byte, client_id: client_id}));
        } else {
            socket.emit('mem read return', { name: name, ID: ID, status: ONFAILURE, err_msg: "DCA is offline." });
        }
    });

    socket.on('mem write', (name, ID, addr, byte, value) => {
        console.log("\x1b[34mUser Command:\x1b[0m Memory write command received from board %s:%d for %d bytes at %s - Value: %s.\n", name, ID, byte, addr, value);
        if (DCAStatus) {
            commandProxy.write(JSON.stringify({ opcode: BRD_MEM_W, param1: name, param2: ID, param3: addr, param4: byte, param5: value, client_id: client_id}));
        } else {
            socket.emit('mem write return', { name: name, ID: ID, status: ONFAILURE, err_msg: "DCA is offline." });
        }
    });

    socket.on('set threshold', (name, ID, threshold) => {
        console.log("\x1b[34mUser Command:\x1b[0m Set threshold command received from board %s: %d, threshold: %d.", name, ID, threshold);
        if(DCAStatus) {
            commandProxy.write(JSON.stringify({ opcode: BRD_THR, param1: name, param2: ID, param3: threshold, client_id: client_id}));
        } else {
            socket.emit('set threshold return', {name: name, ID: ID, status: ONFAILURE, err_msg: "DCA is offline."});
        }
    });

    // TODO: Currently frontend will not handle the return for this command.
    socket.on('set warning cap', (name, ID, cap) => {
        console.log("\x1b[34mUser Command:\x1b[0m Set warning cap command received from board %s: %d, cap: %d.", name, ID, cap);
        if (DCAStatus) {
            commandProxy.write(JSON.stringify({ opcode: SET_ALRT_CAP, param1: name, param2: ID, param3: cap, client_id: client_id }));
        } else {
            socket.emit('set warning cap return', { name: name, ID: ID, status: ONFAILURE, err_msg: "DCA is offline." });
        }
    });

    socket.on('error', (error) => {
        console.log("Client met error: %s. Hash: %s.", error.code, client_id);
    });

    // This happens when broswer disconnet from server
    socket.on('disconnect', (reason) => {
        console.log("Client disconnected: %s. Hash: %s.", reason, client_id);
        delete client_table[client_id];
    });
});

// Command Proxy - DCA proxy
commandProxy.on('connect', function(err){
    console.log('\x1b[32mDCA Client:\x1b[0m Connection Setup.');
    commandProxy.setEncoding("utf8");
    DCAStatus = 1;
});

commandProxy.on('error',(res) =>{
    console.log('\x1b[31mDCA Client:\x1b[0m Error on DCA connection: ' + res.address + '/' + res.port + '. Error Code: ' + res.code);
    DCAStatus = 0;
});

commandProxy.on('close', () => {
    console.log('\x1b[31mDCA Client:\x1b[0m -> DCA is disconneted.\n ');
    DCAStatus = 0;
});

commandProxy.on('data', (data) => {
    console.log('\x1b[32mDCA Client:\x1b[0m -> From DCA received data packet: ' + data);
    var packet = JSON.parse(data);
    if (packet.opcode === BRD_RST) {
        if (packet.return === ONSUCCESS) {
            client_table[packet.client_id].emit('reset return', {name: packet.name, ID: packet.id, status: ONSUCCESS});
        } else {
            client_table[packet.client_id].emit('reset return', {name: packet.name, ID: packet.id, status: ONFAILURE, err_msg: packet.err_msg});
        }
    }

    if (packet.opcode === BRD_MEM_R) {
        if (packet.return === ONSUCCESS) {
            client_table[packet.client_id].emit('mem read return', {name: packet.name, ID: packet.id, status: ONSUCCESS, content: packet.content});
        } else {
            client_table[packet.client_id].emit('mem read return', {name: packet.name, ID: packet.id, status: ONFAILURE, err_msg: packet.err_msg});
        }
    }

    if (packet.opcode === BRD_MEM_W) {
        if (packet.return === ONSUCCESS) {
            client_table[packet.client_id].emit('mem write return', {name: packet.name, ID: packet.id, status: ONSUCCESS});
        } else {
            client_table[packet.client_id].emit('mem write return', {name: packet.name, ID: packet.id, status: ONFAILURE, err_msg: packet.err_msg});
        }
    }

    if (packet.opcode === BRD_THR) {
        if (packet.return === ONSUCCESS) {
            client_table[packet.client_id].emit('set threshold return', {name: packet.name, ID: packet.id, status: ONSUCCESS});
        } else {
            client_table[packet.client_id].emit('set threshold return', {name: packet.name, ID: packet.id, status: ONFAILURE, err_msg: packet.err_msg});
        }
    }
    
});

// DCA reconnect routine
setInterval(() => {
    if(!DCAStatus){
        commandProxy.connect(config.get('command server.port'), config.get('command server.host'));
    }
}, config.get('web server.DCA reconnection interval'));

module.exports = app;

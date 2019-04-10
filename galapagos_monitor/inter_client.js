/* now connect to tempporary server and retrieve random value*/
var net = require('net');
var process = require('process');  //for debugging ONLY


function sleep(ms){
	return new Promise(resolve => setTimeout(resolve,ms))
}

process.on('message', async (config) => {
	var temperature_tmp = 0;
	var fetcher = new net.Socket();
	var connected = false;
	var tmp = 0;
	var ip = '127.0.0.1';   //tmp
	var port = 5000;   //tmp
	
	//update the ip and port
	ip = config.IP;
	port = config.port;
	
	while(true){
		//connect to the target ip address
		if(!connected)	{
			console.log('init connection with target ip ' + process.pid);
			fetcher.connect(port,ip, function(){
			});

			//in case the board is not available yet
			fetcher.once('error', function(err){
				console.log('Given address is not currently available('+process.pid+'): ip ' + ip);
				fetcher.destroy();
				fetcher = new net.Socket();
			});

			fetcher.once('connect',function(){
				connected = true;
			});
		}
		fetcher.write('/');
		
		//retrieve data
		fetcher.once('data', function(data){
			//console.log(data);
			tmp = parseInt(data, 16);
			temperature_tmp = Math.floor((tmp * 503.975 / 4096) - 273.15); 
			process.send(temperature_tmp);
		});

		//wait for a sec
		await sleep(1000);
	}
});



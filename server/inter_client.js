/* now connect to tempporary server and retrieve random value*/
var ip = 0;
var net = require('net');

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve,ms))
}

process.on('message', async (ip_recv) => {
	var temperature_tmp = 0;
	var fetcher = new net.Socket();
	var connected = false;

	while(true){
		//connect to the target ip address
		if(!connected)	{
			//var fetcher = new net.Socket();
			console.log('init connection with target ip');
			fetcher.connect(5000,'127.0.0.1', function(){
				fetcher.write('/');
			});
			connected = true;
		}
		else{
			fetcher.write('/');
		}
		
		
		//retrieve data
		fetcher.once('data', function(data){
			temperature_tmp = parseInt(data, 10);
			//fetcher.destroy();
			process.send(temperature_tmp);
		});

		//temperature_tmp = Math.floor(Math.random() * 1000);
		//process.send(temperature_tmp);

		//wait for a sec
		await sleep(1000);
	}
});



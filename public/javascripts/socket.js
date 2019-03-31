const socket = io('http://localhost:5557'); // Checklist: change to external server IP

// Command Status Code
const ONSUCCESS = 1;
const ONFAILURE = 2;

$(function (){
    socket.on('temperature update', function(data) {
		console.log("Updating Canvas: " + Global.activeTab);

        var statusstring = 'online';
        var temp = '#temperatureval' + data.id.toString();
        var board = '#boardstatus' + data.id.toString();
        $(temp).text(data.temperature);
        $(board).text(statusstring);

		//pop out old data if # of datapoints is more than expected
		if(Global.configs[data.id].data.datasets[0].data.length >= Global.numGraphPoints){
			Global.configs[data.id].data.datasets.forEach(function (dataset) {
				dataset.data.splice(0, dataset.data.length - Global.numGraphPoints);
			});
		}
		
		// TODO: check data.time
		var current = newTimeString(0);
		console.log("On Update: Actual source time = "+ data.time + ", current time = " + current);
		console.log("data.time type: "+ typeof(data.time) + ", current type: " + typeof(current));

		Global.configs[data.id].data.datasets[0].data.push({
			x: moment(data.time, "YYYY MM DD, hh:mm:ss").format(), //  data.time
        	y: data.temperature
    	});

		window['Chart'+ data.id].update();

		// Page pop up alert
		if (data.temperature > Global.warningCap) {
			if (!Global.alertTimer) {
				console.log("page alert logic triggered.");
				alert("Warning: Latest Value Beyond " + Global.warningCap.toString() + " at board " + Global.activeTab + " !");
				Global.alertTimer = setInterval(() => {
					alert("Warning: Latest Value Beyond " + Global.warningCap.toString() + " at board " + Global.activeTab + " !");
				}, 30000); // 30s
			}
		} else {
			clearInterval(Global.alertTimer);
			Global.alertTimer = undefined;
		}
	});
	
	socket.on('connect_error' , function(err){
		console.log('connect_error');
		// clear timer
		clearInterval(Global.updateTimer);
		Global.updateTimer = undefined;

		clearInterval(Global.alertTimer);
		Global.alertTimer = undefined;
	});

	 
	socket.on('reset return' , function(packet){
		if(packet.status === ONSUCCESS) {
			alert("Board "+ packet.name+" has been reset successfully.", );
		} else {
			alert("Board "+ packet.name+" failed to reset: " + packet.err_msg, );
		}
	});

	socket.on('set threshold return' , function(packet){
		if(packet.status === ONSUCCESS) {
			alert("Board "+ packet.name+" has changed reset threshold successfully.", );
		} else {
			alert("Board "+ packet.name+" failed to change reset threshold: " + packet.err_msg, );
		}
	});

	socket.on('mem read return' , function(packet){
		var ret = document.getElementById("messageReturn");
		if(packet.status === ONSUCCESS) {
			ret.innerText = "Memory payload for board "+ packet.name+": " + packet.content;
			ret.style = "color: green";
		} else {
			ret.innerText = "Memory read failed on board "+ packet.name+": " + packet.err_msg;
			ret.style = "color: red";
		}
	});

	socket.on('mem write return' , function(packet){
		var ret = document.getElementById("messageReturn");
		if(packet.status === ONSUCCESS) {
			ret.innerText = "Memory write succeeded for board "+ packet.name+".";
			ret.style = "color: green";
		} else {
			ret.innerText = "Memory write failed on board "+ packet.name+": " + packet.err_msg;
			ret.style = "color: red";
		}
	});

	socket.on('dashboard update' , function(data){
		console.log('Received package from dashboard update.')
		console.log(data);
		var index = 0;
		for (var item in data) {
			Global.configs[0].data.datasets[index].data = [data[item]];
			var statusstring = 'online';
			var temp = '#temperatureval' + Global.board_info[item].ID;
			var board = '#boardstatus' + Global.board_info[item].ID;
			$(temp).text(data[item]);
			$(board).text(statusstring);
			index++;
		}

		window.Chart0.update();
	}); 
});

socket.on('connect', () => {
	Global.updateTimer = setInterval(function () {
		// console.log(Global.tracking);
		// console.log(Object.keys(Global.tracking).length);
		if (Global.activeTab && Global.activeTab !== "Overview") {
			socket.emit('request', Global.board_info[Global.activeTab].ID);
		} else if (Global.activeTab === "Overview" && Object.keys(Global.tracking).length) {
			socket.emit('dashboard', Global.tracking);
		}

	}, Global.updateInterval);
});

socket.on('disconnect', (reason) => {

	// clear timer
	clearInterval(Global.updateTimer);
	Global.updateTimer = undefined;

	clearInterval(Global.alertTimer);
	Global.alertTimer = undefined;

	if (reason === 'io server disconnect') {
		// the disconnection was initiated by the server, need to reconnect manually
		socket.connect();
	}
});
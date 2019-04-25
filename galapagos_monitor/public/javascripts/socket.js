const socket = io('http://localhost:5557'); // Checklist: change to external server IP

// Command Status Code
const ONSUCCESS = 1;
const ONFAILURE = 2;

$(function (){
    socket.on('temperature update', function(data) {
		console.log("Updating Canvas: " + Global.activeTab);

		var board = '#boardstatus' + data.id.toString();
		var temp = '#temperatureval' + data.id.toString();
		var statusstring = 'online';

		// Caution: Might have bug for unforeseen condition - Pure string comparsion here. 
		// Try moment(current_timestamp).isSame(last_timestamp)? # TODO
		// TimeZone is ignored. See dashboard logic comment for detail.
		if(offline_logic(data.time)) {
			console.log("offline logic");
			statusstring = 'offline';
			$(board).text(statusstring);
			$(temp).text("data expired");
			return;
		}

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
		
        $(temp).text(data.temperature);
        $(board).text(statusstring);

		//pop out old data if # of datapoints is more than expected
		if(Global.configs[data.id].data.datasets[0].data.length >= Global.numGraphPoints){
			Global.configs[data.id].data.datasets.forEach(function (dataset) {
				dataset.data.splice(0, dataset.data.length - Global.numGraphPoints);
			});
		}
		
		// TODO: check data.time
		// var current = newTimeString(0);
		// console.log("On Update: Actual source time = "+ data.time + ", current time = " + current);
		// console.log("data.time type: "+ typeof(data.time) + ", current type: " + typeof(current));

		Global.configs[data.id].data.datasets[0].data.push({
			x: moment(data.time, "YYYY MM DD, HH:mm:ss").format(), //  data.time
        	y: data.temperature
    	});

		window['Chart'+ data.id].update();

		
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
		// data format: {boardName : [temp, timestamp] , ...}
		// Key [boardName] should strictly match trackingList.
		console.log('Received package from dashboard update.')
		console.log(data);
		var index = 0;

		for (var item in data) {
			var statusstring = 'online';
			var temp = '#temperatureval' + Global.board_info[item].ID;
			var board = '#boardstatus' + Global.board_info[item].ID;

			if (!data[item][0]) {
				console.log("undefined logic");
				statusstring = 'offline';
				$(board).text(statusstring);

				index++;
				continue;
			}

			var last_timestamp = data[item][1];

			// comparision: if timestamp is more than 3 sec diff from current time 
			// TODO: Time zone is not considered. If system time has different time zone from server side, this logic will certainly fail.
			// May have to parseZone(). But at this moment we don't take this issue seriously.
			// Also, timestamp_diff may overflow for a really long time gap. 
			if (offline_logic(last_timestamp)) {
				console.log("offline logic");
				statusstring = 'offline';
				$(board).text(statusstring);
				$(temp).text("data expired");
				index++;
				continue;
			}

			// update chart data list
			Global.configs[0].data.datasets[index].data = [data[item][0]];
			$(temp).text(data[item][0]);
			$(board).text(statusstring);
			index++;
		}

		window.Chart0.update();
	}); 
});

socket.on('connect', () => {
	Global.updateTimer = setInterval(function () {
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

function offline_logic(last_timestamp) {
	var current_timestamp = newTimeString(0);
	var timestamp_diff = moment(current_timestamp, "YYYY MM DD, HH:mm:ss").diff(moment(last_timestamp, "YYYY MM DD, HH:mm:ss"), 'seconds');
	return timestamp_diff > 3;
}
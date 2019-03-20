const socket = io('http://localhost:5557');

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

		if(Global.configs[data.id].data.datasets[0].data[Global.configs[data.id].data.datasets[0].data.length - 1].y > Global.warningCap)
			alert("Warning: Latest Value Beyond "+ Global.warningCap.toString()+" at board "+ Global.activeTab + " !", );

		//pop out old data if # of datapoints is more than expected
		if(Global.configs[data.id].data.datasets[0].data.length >= Global.numGraphPoints){
			Global.configs[data.id].data.datasets.forEach(function (dataset) {
				dataset.data.splice(0, dataset.data.length - Global.numGraphPoints);
			});
		}

		console.log("On Update: Actual source time = "+ data.time);
		
		Global.configs[data.id].data.datasets[0].data.push({
        	x: newTimeString(0), // data.time
        	y: data.temperature
    	});

		window['Chart'+ data.id].update();
	});
	
	socket.on('connect_error' , function(err){
		console.log(err);
	});
	 
	socket.on('reset return' , function(packet){
		if(packet.status === ONSUCCESS) {
			alert("Board "+ packet.name+" has been reset successfully.", );
		} else {
			alert("Board "+ packet.name+" failed to reset: " + packet.err_msg, );
		}
	});

	socket.on('dashboard update' , function(data){
		console.log('Received package from dashboard update.')
		console.log(data);
		var index = 0;
		for (var item in data) {
			Global.configs[0].data.datasets[index].data = [data[item]];
			index++;
		}

		window.Chart0.update();
	}); 
});


//function to add monitoring board
function addBoardFunc(){

	var board_name = document.getElementById('selectBoard').value;
	
	if (board_name in Global.tracking)
		return;

	var id = Global.board_info[board_name].ID;

	console.log("Adding board " + board_name + ": " + id);

	var config = {
    	type: 'line',
		data: {
			datasets: [{
				label: 'Dataset 1',
				backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(), //set color to random??
				borderColor: window.chartColors.blue,
				pointRadius: 5,
				pointHitRadius: 10,
				pointBackgroundColor: 'rgb(150, 180, 235)',
				pointBorderColor: 'rgb(150, 180, 235)',
				fill: false,
				data: [{}],
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: 'Template Chart',
				fontColor: '#FFFFFF',
				fontSize: 20,
				fontStyle: 'bold',
				fontFamily: "Helvetica"
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						displayFormats: {
							quarter: 'MMM D h:mm:ss a'
						}
					},	
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Time',
						fontColor: '#FFFFFF',
						fontSize:20,
						fontStyle: 'bold',
						fontFamily: "Helvetica"
					},
					ticks: {
						major: {
							fontStyle: 'bold',
							fontColor: '#FFFFFF',
							suggestedMin: newTimeString(-10),
                    		suggestedMax: newTimeString(5)
						},
						
					},
					gridLines:{
						color: '#FFFFFF',
						lineWidth: 0.3
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Temperature',
						fontColor: '#FFFFFF',
						fontSize:20,
						fontStyle: 'bold',
						fontFamily: "Helvetica"
					},
					gridLines:{
						color: '#FFFFFF',
						lineWidth: 0.5,
						zeroLineColor: '#FFFFFF',
						zeroLineWidth: 3,
					},
					ticks: {
						fontStyle: 'bold',
						fontColor: '#FFFFFF'
					},
					color: '#FFFFFF',
					
				}]
			},
			legend: {
				labels:{
					fontColor: 'rgb(255,255,255)',
					fontSize:15,
					fontStyle: 'bold',
				}
			}
		}
	};

	// add line for new board
	var string_to_add = '<tr>\n<td>'+ board_name+'</td>\n<td><span id="boardstatus'+ id+'">offline</span></td>\n<td><span id="temperatureval'+id+'">no data yet</span></td>';
    $('#monitoringtable').append(string_to_add);

	// add new canvas for new board
	var canvas_to_add = '\n<div id='
		+board_name
		+' class="tabcontent">\n<h3>'
		+board_name+'</h3><button type="button" onclick="resetBoard(\''
		+board_name
		+'\')">Reset this board</button>\n<br>\n<canvas class="chartjs-render-monitor" id="canvas'
		+ id 
		+'" style="display: block; width: 862px; height: 431px;" width="862" height="431"></canvas>\n<br>\n<br>\n</div>';
	var tab_to_add = '\n<button class="tablinks", onclick="openCanvas(event,\''+board_name+'\')">'+board_name+'</button>';
    $('#board_tabs').append(tab_to_add);
	$('#tab_contents').append(canvas_to_add);
	console.log(canvas_to_add);
	
	var canvas_str = 'canvas' + id;
	var ctx = document.getElementById(canvas_str).getContext('2d');
	Global.configs[Global.board_info[board_name].ID] = config;
	window['Chart' + id] = new Chart(ctx, Global.configs[Global.board_info[board_name].ID]);
	
	// add new bar to dashboard
	var index = Object.keys(Global.tracking).length % Object.keys(window.chartColors).length;
	var col = window.chartColors[Object.keys(window.chartColors)[index]];
	Global.tracking[board_name] = {ID: id};
	console.log(Object.keys(window.chartColors)[index]);
	Global.configs[0].data.datasets.push({
		label: [board_name],     // Board names update here
		backgroundColor: color(col).alpha(0.8).rgbString(), 
		borderColor: col,
		hoverBackgroundColor: color(col).alpha(0.5).rgbString(),
		hoverBorderColor: color(col).alpha(0.8).rgbString(),
		borderWidth: 3,
		fill: false,
		data: [0]
	});
	window.Chart0.update();
}

socket.on('connect', () => {
	Global.timer = setInterval(function(){
		// console.log(Global.tracking);
		// console.log(Object.keys(Global.tracking).length);
		if (Global.activeTab && Global.activeTab !== "Overview") {
			socket.emit('request', Global.board_info[Global.activeTab].ID);
		} else if (Global.activeTab === "Overview" && Object.keys(Global.tracking).length) {
			socket.emit('dashboard', Global.tracking);
		}
		
	},Global.updateInterval);
});

socket.on('disconnect', (reason) => {
	if (reason === 'io server disconnect') {
		// the disconnection was initiated by the server, need to reconnect manually
		socket.connect();
	}
	clearInterval(Global.timer);
});

function resetBoard(name){
	socket.emit('reset', name, Global.board_info[name].ID);
}
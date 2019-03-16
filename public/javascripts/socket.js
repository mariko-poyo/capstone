const socket = io('http://localhost:5556');


$(function (){
    socket.on('update', function(data) {
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
});


//function to add monitoring board
function addBoardFunc(){

    var board_name = document.getElementById('selectBoard').value;

	var id = Global.board_info[board_name].ID;

	console.log("Adding board " + board_name + ": " + id);

	var config = {
    	type: 'line',
		data: {
			datasets: [{
				label: 'Dataset 1',
				backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(), //set color to random??
				borderColor: window.chartColors.blue,
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
							fontColor: '#FFFFFF'
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

	//add line for new board
	var string_to_add = '<tr>\n<td>'+ board_name+'</td>\n<td><span id="boardstatus'+ id+'">offline</span></td>\n<td><span id="temperatureval'+id+'">no data yet</span></td>';
    $('#monitoringtable').append(string_to_add);

	//add new canvas for new board
	var canvas_to_add = '\n<div id='+board_name+' class="tabcontent">\n<h3>'+board_name+'</h3><canvas class="chartjs-render-monitor" id="canvas'+ id +'" style="display: block; width: 862px; height: 431px;" width="862" height="431"></canvas>\n<br>\n<br>\n</div>';
	var tab_to_add = '\n<button class="tablinks", onclick="openCanvas(event,\''+board_name+'\')">'+board_name+'</button>';
    $('#board_tabs').append(tab_to_add);
	$('#tab_contents').append(canvas_to_add);
	
	var canvas_str = 'canvas' + id;
	var ctx = document.getElementById(canvas_str).getContext('2d');
	Global.configs[Global.board_info[board_name].ID] = config;
    window['Chart' + id] = new Chart(ctx, Global.configs[Global.board_info[board_name].ID]);
}


setInterval(function(){
    if (Global.activeTab && Global.activeTab !== "Overview") {
		socket.emit('request', Global.board_info[Global.activeTab].ID);
    }
},Global.updateInterval);
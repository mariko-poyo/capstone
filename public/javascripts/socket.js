var socket = io();
var config_file = './board_config.csv'; //cannot read file without selecting it....????
var board_config = {};

$(function (){
    socket.on('temp val update', function(data) {
        var statusstring = 'online';
        var temp = '#temperatureval' + data.board_num.toString();
        var board = '#boardstatus' + data.board_num.toString();
        $(temp).text(data.temperatureval);
        $(board).text(statusstring);

		configs[data.id].data.datasets[0].data.push({
        	x: newTimeString(0),
        	y: data.temperatureval
    	});

		window['Chart'+ data.id].update();
    });
});


//load board_config.csv, if the file becomes bigger later -> async ?
/*var reader = new FileReader();
function pageOpened(){
    reader.readAsText(config_file);
    reader.addEventListener('loadend', processData);
}

function processData(){
    var allLines = reader.result.split('\\/r/n'|'\\n');
    console.log(allLines);

    var headers = allLines[0].split(',');

    for(var i = 0; i < allLines.length; i++){
        var data = allTextLines[i].split(',');
        if(data.length == headers.length){
            console.log(data);
        }
    }
}*/

//function to add monitoring board
var board_counter = 0;
function addBoardFunc(){

    var board_name = document.getElementById('selectBoard').value;
    console.log(board_name);

	board_counter = board_counter + 1;

	var config_tmp = {
    	type: 'line',
    	data: {
        	datasets: [{
            	label: 'Dataset 1',
            	backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(), //set color to random??
            	borderColor: window.chartColors.blue,
            	fill: false,
            	data: [{
                	x: newTimeString(0),
                	y: randomScalingFactor()
            	}, {
                	x: newTimeString(1),
                	y: randomScalingFactor()
            	}, {
                	x: newTimeString(2),
                	y: randomScalingFactor()
            	}, {
                	x: newTimeString(3),
                	y: randomScalingFactor()
            	}],
        	}]
    	},
    	options: {
        	responsive: true,
        	title: {
            	display: true,
            	text: 'Template Chart'
        	},
        	scales: {
            	xAxes: [{
                	type: 'time',
                	display: true,
                	scaleLabel: {
                    	display: true,
                    	labelString: 'Time'
                	},
                	ticks: {
                    	major: {
                        	fontStyle: 'bold',
                        	fontColor: '#FF0000'
                    	}
                	}
            	}],
            	yAxes: [{
                	display: true,
                	scaleLabel: {
                    	display: true,
                    	labelString: 'Temperature'
                	}
            	}]
        	}	
    	}
	};


	//add line for new board
	var string_to_add = '<tr>\n<td>'+ board_name+'</td>\n<td><span id="boardstatus'+ board_name+'">offline</span></td>\n<td><span id="temperatureval'+board_name+'">no data yet</span></td>';
    $('#monitoringtable').append(string_to_add);

	//add new canvas for new board
	var canvas_to_add = '\n<div id='+board_name+' class="tabcontent">\n<h3>'+board_name+'</h3><canvas class="chartjs-render-monitor" id="canvas'+ board_counter+'" style="display: block; width: 862px; height: 431px;" width="862" height="431"></canvas>\n<br>\n<br>\n</div>';
	var tab_to_add = '\n<button class="tablinks", onclick="openCanvas(event,\''+board_name+'\')">'+board_name+'</button>';
    $('#board_tabs').append(tab_to_add);
	$('#tab_contents').append(canvas_to_add);
	
	var canvas_str = 'canvas' + board_counter;
	var ctx = document.getElementById(canvas_str).getContext('2d');
	configs.push(config_tmp);
    window['Chart' + board_counter] = new Chart(ctx, configs[board_counter]);

    //send add board request to server back-end
    board_config[board_name]["num"] = board_name;
	board_config[board_name]["id"] = board_counter;
    socket.emit('add board', board_config[board_name]);  //change board_counter to ip address later
}

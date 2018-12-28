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

		config.data.datasets[0].data.push({
        	x: newTimeString(0),
        	y: data.temperatureval
    	});

		window.Chart1.update();
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
//var board_counter = 1;
function addBoardFunc(){

    var board_name = document.getElementById('selectBoard').value;
    console.log(board_name);

    //board_counter = board_counter + 1;
    var string_to_add = '<tr>\n<td>'+ board_name+'</td>\n<td><span id="boardstatus'+ board_name+'">offline</span></td>\n<td><span id="temperatureval'+board_name+'">no data yet</span></td>';
    $('#monitoringtable').append(string_to_add);

    //send add board request to server back-end
    board_config[board_name]["num"] = board_name;
    socket.emit('add board', board_config[board_name]);  //change board_counter to ip address later
}

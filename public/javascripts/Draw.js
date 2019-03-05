
function newTimeString(seconds) {
    return moment().add(seconds, 's').format();
}

// Global
var Global = {
    warningCap: 950,
    updateInterval: 2000,
    numGraphPoints: 10,
    activeTab: NaN,
    board_info: {},
    configs: []
};

var color = Chart.helpers.color;

window.onload = function() {

	const Http = new XMLHttpRequest();
    const url='/getBoards';
    
    Http.open("GET", url);
    Http.send();
    
    Http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            boards_data = JSON.parse(this.responseText);
            Global.board_info = boards_data;
            console.log(Global.board_info.Default.ID);
            var op_to_add = '';
            for(item in boards_data){
                //set the config to the selection
                op_to_add += '<br><option value="'+item+'">'+item+'</option>';
            } 
            console.log(op_to_add);
            $('#selectBoard').append(op_to_add);
        }
    };

    var config = {
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
                text: 'Template Chart',
                fontColor: '#FFFFFF',
                fontSize: 20,
                fontStyle: 'bold',
                fontFamily: "Helvetica"
            },
            scales: {
                xAxes: [{
                    type: 'time',
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

    Global.configs[0] = config;
	var ctx = document.getElementById('canvas').getContext('2d');
    window.Chart114514 = new Chart(ctx, Global.configs[0]);

    document.getElementById('submitMaxItem').addEventListener('click', function() {
        reading = document.getElementById("MaxItem").value;
        Global.numGraphPoints = (reading > 2) ? reading : 2;
    });

    document.getElementById('submitInterval').addEventListener('click', function() {
        reading = document.getElementById("Interval").value;
        Global.updateInterval = (reading > 1000) ? reading : 1000;
        socket.emit('interval update',{ interval: Global.updateInterval, boardID: Global.activeTab});
    });

    document.getElementById('submitWarningCap').addEventListener('click', function() {
        Global.warningCap = document.getElementById("WarningCap").value;
    });
};


function openCanvas(evt, board){
    var i, tabcontent, tablinks;
    Global.activeTab = board;
	tabcontent = document.getElementsByClassName("tabcontent");
	tablinks = document.getElementsByClassName("tablinks");

	//hide currently shown one
	for(i =0; i < tabcontent.length;i++){
		tabcontent[i].style.display = "none";
	}

	for(i=0; i < tablinks.length; i++){
		tablinks[i].className = tablinks[i].className.replace(" active","");
	}

	//show the clicked element
	document.getElementById(board).style.display = "block";
	evt.currentTarget.className += " active";
}




function newTimeString(seconds) {
    return moment().add(seconds, 's').format("MMM Do YY, h:mm:ss a");
}

// Global
var Global = {
    warningCap: 950,
    updateInterval: 2000,
    timer: undefined,
    numGraphPoints: 10,
    activeTab: NaN,
    board_info: {},     // Name: {ID, IP, port}
    configs: [],        
    tracking: {}        // Name: ID
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
            // console.log(Global.board_info.Default.ID);
            var op_to_add = '';
            for(item in boards_data){
                //set the config to the selection
                op_to_add += '<br><option value="'+item+'">'+item+'</option>';
            } 
            // console.log(op_to_add);
            $('#selectBoard').append(op_to_add);
        }
    };

    var config = {
        type: 'bar',
        data: {
            datasets: [
            // {
            //     label: ['Test data 1'],     // Board names update here
            //     backgroundColor: color(window.chartColors.blue).alpha(0.8).rgbString(), 
            //     borderColor: window.chartColors.blue,
            //     hoverBackgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
            //     hoverBorderColor: color(window.chartColors.blue).alpha(0.8).rgbString(),
            //     borderWidth: 3,
            //     fill: false,
            //     data: [50]
            // },{
            //     label: ['Test data 2'],     // Board names update here
            //     backgroundColor: color(window.chartColors.red).alpha(0.8).rgbString(), 
            //     borderColor: window.chartColors.red,
            //     hoverBackgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
            //     hoverBorderColor: color(window.chartColors.red).alpha(0.8).rgbString(),
            //     borderWidth: 3,
            //     fill: false,
            //     data: [80]
            // }
            ],
            // labels: [['Default'], ['test']]    // Board IDs update here ? TODO
            
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'category',
                    display: true,
                    barPercentage: 0.5,
                    barThickness: 'flex',
                    maxBarThickness: 50,
                    minBarLength: 2,
                    scaleLabel: {
                        display: true,
                        labelString: 'Board',
                        fontColor: '#FFFFFF',
                        fontSize: 20,
                        fontStyle: 'bold',
                        fontFamily: "Helvetica"
                    },
                    ticks: {
                        major: {
                            fontStyle: 'bold',
                            fontColor: '#FFFFFF'
                        }
                    },
                    color: '#FFFFFF',
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        color: '#FFFFFF',
                        lineWidth: 0.5,
                        zeroLineColor: '#FFFFFF',
                        zeroLineWidth: 3,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature',
                        fontColor: '#FFFFFF',
                        fontSize: 20,
                        fontStyle: 'bold',
                        fontFamily: "Helvetica"
                    },
                    ticks: {
                        fontStyle: 'bold',
                        fontColor: '#FFFFFF',
                        min: 0,
                        max: 120
                    },
                    color: '#FFFFFF',
                }]
            },
            legend: {
                labels: {
                    fontColor: 'rgb(255,255,255)',
                    fontSize: 15,
                    fontStyle: 'bold',
                }
            }
        }
    };

    Global.configs[0] = config;
	var ctx = document.getElementById('canvas').getContext('2d');
    window.Chart0 = new Chart(ctx, Global.configs[0]);

    document.getElementById('submitMaxItem').addEventListener('click', function() {
        reading = document.getElementById("MaxItem").value;
        Global.numGraphPoints = (reading > 2) ? reading : 2;
    });

    document.getElementById('submitInterval').addEventListener('click', function() {
        reading = document.getElementById("Interval").value;
        Global.updateInterval = (reading > 1000) ? reading : 1000;

        // update timer
        if (Global.timer) {
            clearInterval(Global.timer);
            Global.timer = setInterval(function(){
                if (Global.activeTab && Global.activeTab !== "Overview") {
                    socket.emit('request', Global.board_info[Global.activeTab].ID);
                } else if (Global.activeTab === "Overview" && Object.keys(Global.tracking).length) {
                    socket.emit('dashboard', Global.tracking);
                }
            },Global.updateInterval);
        } 

        // socket.emit('interval update',{ interval: Global.updateInterval, boardID: Global.activeTab});
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



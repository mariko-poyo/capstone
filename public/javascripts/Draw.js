function newDate(days) {
    return moment().add(days, 'd').toDate();
}

function newDateString(days) {
    return moment().add(days, 'd').format();
}

function newSecond(seconds) {
    return moment().add(seconds, 's').toTimeString();
}

function newTimeString(seconds) {
    return moment().add(seconds, 's').format();
}

// Global
var itemMax = 10;
var warningCap = 90;
var updateInterval = 1000;

var color = Chart.helpers.color;

var configs = [];
var config = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Dataset 1',
            backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
            borderColor: window.chartColors.red,
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

window.onload = function() {
    configs.push(config);
	var ctx = document.getElementById('canvas').getContext('2d');
    window.Chart0 = new Chart(ctx, configs[0]);

	const Http = new XMLHttpRequest();
	const url='/getBoards';
    Http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            boards_data = JSON.parse(this.responseText);
            var op_to_add = '';
            for(var board_name in boards_data){
                board_config[board_name] = {};
                console.log(board_name);
                for(var key in boards_data[board_name]){
                    console.log("Key: " + key + ", Value: " + boards_data[board_name][key]);
                    board_config[board_name][key] = boards_data[board_name][key];
                }
                //set the config to the selection
                op_to_add += '<br><option value="'+board_name+'">'+board_name+'</option>';
            } 
            console.log(op_to_add);
            $('#selectBoard').append(op_to_add);
        }
    };

	Http.open("GET", url);
	Http.send(); 
};

document.getElementById('randomizeData').addEventListener('click', function() {
    configs[0].data.datasets.forEach(function(dataset) {
        dataset.data.forEach(function(dataObj) {
            dataObj.y = randomScalingFactor();
        });
    });

    window.Chart0.update();	
});

document.getElementById('addData').addEventListener('click', function() {
    configs[0].data.datasets[0].data.push({
        x: newTimeString(0),
        y: randomScalingFactor()
    });
    window.Chart0.update();
});

document.getElementById('removeData').addEventListener('click', function() {
    configs[0].data.datasets.forEach(function(dataset) {
        dataset.data.pop();
    });

    window.Chart0.update();
});


var interval;
document.getElementById('startInterval').addEventListener('click', function() {
    interval = setInterval(function() {
        configs[0].data.datasets[0].data.push({
            x: newTimeString(0),
            y: randomScalingFactor()
        });
        if(configs[0].data.datasets[0].data.length > itemMax) {
            config.data.datasets[0].data.splice(0, config.data.datasets[0].data.length - itemMax);
        }
        window.Chart0.update();	
        if(configs[0].data.datasets[0].data[config.data.datasets[0].data.length - 1].y > warningCap)
            alert("Warning: Latest Value Beyond "+warningCap.toString()+" !", );
    }, updateInterval);
});

document.getElementById('endInterval').addEventListener('click', function() {
    if (interval) {
        clearInterval(interval);
    }
});

document.getElementById('submitMaxItem').addEventListener('click', function() {
    itemMax = document.getElementById("MaxItem").value;
});

document.getElementById('submitInterval').addEventListener('click', function() {
    updateInterval = document.getElementById("Interval").value;
});

document.getElementById('submitWarningCap').addEventListener('click', function() {
    warningCap = document.getElementById("WarningCap").value;
});

function openCanvas(evt, board){
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	tablinks = document.getElementsByClassName("tablinks");

	//hide currently shown one
	for(i =0; i < tabcontent.length;i++){
		tabcontent[i].style.display = "none";
	}

	for(i=0; i < tablinks.length; i++){
		tablinks[i].className = tablinks[i].className.replace("active","");
	}

	//show the clicked element
	document.getElementById(board).style.display = "block";
	evt.currentTarget.className += "active";	
}


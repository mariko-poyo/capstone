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
	
	//tmp
    board_config["Board_1"] = {"IP":'127.0.0.1', "port":5000};
    board_config["Board_2"] = {"IP":'149.248.186.212', "port":2935};
    board_config["Board_3"] = {"IP":'149.248.186.212', "port":2936};

    //set the config to the selection
    for(var key in board_config){
        var op_to_add = '<br><option value="'+key+'">'+key+'</option>';
        $('#selectBoard').append(op_to_add);
    }
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


//function to add monitoring board
function addBoardFunc() {

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
                data: [],
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
                            second: 'h:mm:ss a'
                        },
                        distribution: 'series'
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time',
                        fontColor: '#FFFFFF',
                        fontSize: 20,
                        fontStyle: 'bold',
                        fontFamily: "Helvetica"
                    },
                    ticks: {
                        major: {
                            fontStyle: 'bold',
                            fontColor: '#FFFFFF',
                            source: 'data'
                        },

                    },
                    gridLines: {
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
                        fontSize: 20,
                        fontStyle: 'bold',
                        fontFamily: "Helvetica"
                    },
                    gridLines: {
                        color: '#FFFFFF',
                        lineWidth: 0.5,
                        zeroLineColor: '#FFFFFF',
                        zeroLineWidth: 3,
                    },
                    ticks: {
                        fontStyle: 'bold',
                        fontColor: '#FFFFFF',
                        suggestedMin: 40,
                        suggestedMax: 75
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

    // add line for new board
    var string_to_add = '<tr>\n<td>' + board_name + '</td>\n<td><span id="boardstatus' + id + '">offline</span></td>\n<td><span id="temperatureval' + id + '">no data yet</span></td>';
    $('#monitoringtable').append(string_to_add);

    // add new canvas for new board
    var canvas_to_add = '\n<div id='
        + board_name
        + ' class="tabcontent">\n<h3>'
        + board_name + '</h3><button type="button" onclick="resetBoard(\''
        + board_name
        + '\')">Reset this board</button>\n<br>\n<canvas class="chartjs-render-monitor" id="canvas'
        + id
        + '" style="display: block; width: 862px; height: 431px;" width="862" height="431"></canvas>\n<br>\n<br>\n</div>';
    var tab_to_add = '\n<button class="tablinks", onclick="openCanvas(event,\'' + board_name + '\')">' + board_name + '</button>';
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
    Global.tracking[board_name] = id;
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

function resetBoard(name) {
    socket.emit('reset', name, Global.board_info[name].ID);
}

function setThreshold() {
    var name = Global.activeTab;

    var ret = document.getElementById("messageReturn");

    if (name === 'Overview' || !name) {
        ret.innerText = "Invalid operation: Select a specific board.";
        ret.style = "color: red";
        return;
    }

    var threshold = parseInt(document.getElementById("Threshold").value);
    socket.emit('set threshold', name, Global.board_info[name].ID, threshold);
}

function memRead() {
    var name = Global.activeTab;

    // change text at #messageReturn on page depend on return received.
    var ret = document.getElementById("messageReturn");

    if (name === 'Overview' || !name) {
        ret.innerText = "Invalid operation: Select a specific board.";
        ret.style = "color: red";
        return;
    }

    var id = Global.board_info[name].ID;
    var address = document.getElementById("MemoryAddress").value;
    var byte = document.getElementById("Byte").value;

    ret.innerText = ""

    socket.emit('mem read', name, id, address, byte);
}

function memWrite() {
    var name = Global.activeTab;

    var ret = document.getElementById("messageReturn");

    if (name === 'Overview' || !name) {
        ret.innerText = "Invalid operation: Select a specific board.";
        ret.style = "color: red";
        return;
    }

    var id = Global.board_info[name].ID;
    var address = document.getElementById("MemoryAddress").value;
    var byte = parseInt(document.getElementById("Byte").value);
    var value = document.getElementById("Value").value.padEnd(byte * 2, '0');

    ret.innerText = ""
    socket.emit('mem write', name, id, address, byte, value);
}

function setWarningCap() {

    var name = Global.activeTab;

    var ret = document.getElementById("messageReturn");

    if (name === 'Overview' || !name) {
        ret.innerText = "Invalid operation: Select a specific board.";
        ret.style = "color: red";
        return;
    }

    var reading = document.getElementById("WarningCap").value;
    Global.warningCap = reading;
    socket.emit('set warning cap', name, Global.board_info[name].ID, reading);

    ret.innerText = "Successfully set page warning cap value:" + Global.warningCap + ".";
    ret.style = "color: green";
}

function submitMaxItem() {
    var reading = document.getElementById("MaxItem").value;
    Global.numGraphPoints = (reading > 2) ? reading : 2;

    ret.innerText = "Successfully set line chart porperty: max shown points number to " + Global.numGraphPoints + ".";
    ret.style = "color: green";
}

function submitInterval() {
    var reading = document.getElementById("Interval").value;
    Global.updateInterval = (reading > 1000) ? reading : 1000;

    ret.innerText = "Successfully set line chart porperty: update interval to" + Global.updateInterval + ".";
    ret.style = "color: green";

    // update timer
    if (Global.updateTimer) {
        clearInterval(Global.updateTimer);
        Global.updateTimer = setInterval(function () {
            if (Global.activeTab && Global.activeTab !== "Overview") {
                socket.emit('request', Global.board_info[Global.activeTab].ID);
            } else if (Global.activeTab === "Overview" && Object.keys(Global.tracking).length) {
                socket.emit('dashboard', Global.tracking);
            }
        }, Global.updateInterval);
    }
}

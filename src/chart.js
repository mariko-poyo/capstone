var dataStore = new FusionCharts.DataStore();

new FusionCharts({
    type: 'timeseries',
    renderAt: 'chart-container',
    width: '100%',
    height: '500',
    dataSource: {
        caption: {
            text: 'Sales Analysis'
        },
        subcaption: {
            text: 'Grocery'
        },
        yAxis: [{
            plot: {
                value: 'Grocery Sales Value',
                type: 'line'
            },
            format: {
                prefix: '$'
            },
            title: 'Sale Value'
        }],
        data: dataStore.createDataTable(data, schema)
    }
}).render();
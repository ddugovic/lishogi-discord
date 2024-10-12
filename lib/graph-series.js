const QuickChart = require('quickchart-js');

function graphSeries(series, width, height) {
    return new QuickChart().setConfig({
        type: 'sparkline',
        data: { datasets: series },
        options: {
            scales: { yAxes: [{ stacked: true }] }
        }
    }).setWidth(width ?? 500).setHeight(height ?? 300);
}

module.exports = graphSeries;

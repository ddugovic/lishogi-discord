const QuickChart = require('quickchart-js');

function graphPerfHistory(data, history, now) {
    const domain = [Math.min(...data.map(point => point.t)), now.getTime()];
    return new QuickChart().setConfig({
        type: 'line',
        data: { labels: domain, datasets: history.filter(series => series.data.length) },
        options: { scales: { xAxes: [{ type: 'time' }] } }
    });
}

module.exports = graphPerfHistory;

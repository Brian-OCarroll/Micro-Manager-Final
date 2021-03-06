let stockChart;
let graphLabels;
let graphData;

$('#my-lists').on('click', '.expand', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // save form search data to sessionStorage
    let symbol = $(this).attr('data-symbol');
    let load = $(this).siblings('.ajax-loader');
    const options = {
        url: '/stockpull',
        type: 'GET',
        cache: true,
        beforeSend: function(){
            load.show()
        },
        contentType: "application/json; charset=utf-8",
        data: {
            symbol: symbol
        },
        dataType: 'json'
    };
    $.ajax(options)
        .then(function (data) {
            console.log(data)
           let arrayData = data;

            graphLabels = { '1W': [], '1M': [], '3M': [], '1Y': [], '5Y': [] };
            graphData = { '1W': [], '1M': [], '3M': [], '1Y': [], '5Y': [] };
            for (let i = 0; i < arrayData.length; i++) {
                if (moment(arrayData[i].date).isAfter(moment().subtract(1, 'week').format("YYYY-MM-DD"))) {
                    graphLabels['1W'].unshift(arrayData[i].date);
                    graphData['1W'].unshift(arrayData[i].close);
                }
                if (moment(arrayData[i].date).isAfter(moment().subtract(1, 'months').format("YYYY-MM-DD"))) {
                    graphLabels['1M'].unshift(arrayData[i].date);
                    graphData['1M'].unshift(arrayData[i].close);
                }
                if (moment(arrayData[i].date).isAfter(moment().subtract(3, 'months').format("YYYY-MM-DD"))) {
                    graphLabels['3M'].unshift(arrayData[i].date);
                    graphData['3M'].unshift(arrayData[i].close);
                }
                if (moment(arrayData[i].date).isAfter(moment().subtract(1, 'years').format("YYYY-MM-DD"))) {
                    graphLabels['1Y'].unshift(arrayData[i].date);
                    graphData['1Y'].unshift(arrayData[i].close);
                }
                if (moment(arrayData[i].date).isAfter(moment().subtract(5, 'years').format("YYYY-MM-DD"))) {
                    graphLabels['5Y'].unshift(arrayData[i].date);
                    graphData['5Y'].unshift(arrayData[i].close);
                }
            }
            //current days data
            let todayData = arrayData[0];
            //get 52 week high/low
            let arrayLow = [];
            let arrayHigh = [];
            let arrayVol = 0;
            for (let i = 0; i < 365 && i < arrayData.length; i++) {
                arrayLow.push(parseInt(arrayData[i].low));
                arrayHigh.push(parseInt(arrayData[i].high));
                arrayVol += parseInt(arrayData[i].volume);
            }
            todayData['symbol'] = symbol;
            todayData['tlow'] = `${Math.min.apply(null, arrayLow)}`;
            todayData['thigh'] = `${Math.max.apply(null, arrayLow)}`;
            let tvol = arrayVol / arrayData.length;
            todayData['tVol'] = `${tvol}`
            let html = `
            <div class="results">
            <div class="topflex">
            <p class="symbol"  data-symbol="${todayData.symbol}">${todayData.symbol.toUpperCase()}</p>
            <p class="closing" data-symbol="${todayData.close}"><strong>Close:</strong> ${todayData.close}</p>
            </div>
            <p class="dayhigh" data-high="${todayData.high}">High: ${todayData.high}</p>
            <p class="daylow" data-low="${todayData.low}">Low: ${todayData.low}</p>
            <p class="yearhigh" data-thigh="${todayData.thigh}">52 Week High: ${todayData.thigh}</p>
            <p class="yearlow" data-tlow="${todayData.tlow}">52 Week Low: ${todayData.low}</p>
        </div>
        `;
            $('.stock-quote').html(html);
            $('.graph').show();
            return;
        })
        .then(function (data) {

            stockChart = new Chart(
                $(".chart-js"),
                {
                    "type": "line",
                    "data": {
                        "labels": graphLabels['1M'], //array of labels
                        "datasets": [
                            {
                                "label": "Symbol",
                                "data": graphData['1M'], //array of data
                                "fill": false,
                                "borderColor": "rgb(214, 51, 51)",
                                "lineTension": 0.1
                            }
                        ]
                    },
                    "options": {
                        elements: {
                            point: {
                                radius: 0
                            }
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            gridLines: {
                                color: "white"
                            },
                            yAxes: [{
                                ticks: {
                                    fontColor: "white"
                                }
                            }],
                            xAxes: [{
                                type: 'time',
                                distribution: 'series',
                                bounds: 'data',
                                ticks: {
                                    fontColor: "white",
                                    source: 'data',
                                    display: true //set to false to remove x axis labels
                                }
                            }]
                        }
                    }
                });

            renderGraph(stockChart, graphLabels['1M'], graphData['1M']);
            $(".time-button:contains('1M')").addClass('graph-select active');
            $(".graph").addClass('load');
        })
        .done(() => {
            $('.ajax-loader').hide();
            $.fancybox.open({
                src: '#hidden-lightbox',
                type: 'inline',
                opts: {
                    beforeShow: function() {
                        $(".lightbox-container");
                    },
                    afterShow: function (instance, current) {
                        handleGraph();
                    },
                    afterClose: function (slide) {
                        $('.graph').html('');
                        $('.stock-quote').html('');
                        $('.graph').html(`
                        <form class="graph-buttons">
                        <button class="time-button" type="button">1W</button>
                        <button class="time-button" type="button">1M</button>
                        <button class="time-button" type="button">3M</button>
                        <button class="time-button" type="button">1Y</button>
                        <button class="time-button" type="button">5Y</button>
                    </form>
                    <canvas class="chart-js col-12"></canvas>
                        `);
                    }
                }
            });
        })
        .fail(function (data) {
            alert('Please wait a minute and then try again!')
        })
});




function handleGraph() {
    $('.time-button').on('click', function (event) {
        $('.time-button').removeClass('graph-select active');
        let timeScale = $(this).text();
        $(this).addClass('graph-select active');

        renderGraph(stockChart, graphLabels[timeScale], graphData[timeScale]);
    });
}
function hideGraph() {
    $(".graph").removeClass('load');
}

function renderGraph(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets.forEach((dataset) => {
        dataset.data = data;
    });
    chart.update();
}


$(handleGraph);



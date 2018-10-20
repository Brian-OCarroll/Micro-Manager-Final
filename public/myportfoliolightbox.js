let stockChart;
let graphLabels;
let graphData;
$('#my-lists').on('click', '.expand', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // save form search data to sessionStorage
    
    let symbol = $('.clickable-cards').attr('data-symbol');
    const options = {
        url: '/stockpull',
        type: 'GET',
        cache: true,
        contentType: "application/json; charset=utf-8",
        data: {
            symbol: symbol
        },
        dataType: 'json'
    };
    $.ajax(options)
        .fail(function (data) {
            console.log(data)
            $('.lightbox-container').html('Stock could not be found')
            $('.graph').hide()
        })
        .then(function (data) {
            console.log(data)
            $('.graph').show();
            //set only the width for images
            let html = `
        <div class="results">
            <img src="${data.companyImage}" alt="${data.symbol} parent company" width="42">
            <p class="symbol"  data-symbol="${data.symbol}">${data.symbol}</p>
            <p class="parent-comp" data-company="${data.parentCompany}">${data.parentCompany}</p> 
            <p class="company-description" data-description="${data.companyDescription}">${data.companyDescription}</p>
            <p class="closing" data-symbol="${data.close}">Close: ${data.close}</p>
            <p class="dayhigh" data-high="${data.high}">High: ${data.high}</p>
            <p class="daylow" data-low="${data.low}">Low: ${data.low}</p>
            <p class="yearhigh" data-thigh="${data.thigh}">52 Week High: ${data.thigh}</p>
            <p class="yearlow" data-tlow="${data.tlow}">52 Week Low: ${data.low}</p>
        </div>
        `;
            // let html2 = `       
            // <p>save to portfolio</p>
            // <button type="submit" class="save-portfolio-button">Save Here</button>
            // `
            $('.stock-quote').html(html);
            // $('.add-to-portfolio').html(html2)
        })

    const options2 = {
        url: '/stockpull/graph',
        type: 'GET',
        cache: true,
        data: {
            symbol: symbol,
        },
        dataType: 'json',
    };
    $.ajax(options2)
        .then(function (data) {
            function fixKeys(obj) {
                Object.keys(obj).forEach(function (key) {
                    let newName = key.split('.')[1].trim();
                    //dynamic form of obj.newKey
                    obj[newName] = obj[key];
                    delete obj[key];
                });
                return obj;
            }

            // let metaData = data["Meta Data"]
            // let symbol = metaData["2. Symbol"]

            //the main object with all dates by day
            // let fullData = data[stockDay.json];
            let fullData = data["Time Series (Daily)"];
            let arrayData = [];
            // adds a key value pair for the date, with the date of the stock quote, 
            //and then deletes the key 'Time Series (Daily)'
            Object.keys(fullData).map(function (key) {
                let obj = {};
                obj = fixKeys(fullData[key]);
                obj['date'] = key;
                arrayData.push(obj);
            });

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

        })
        .done(function (data) {
            console.log(graphLabels)
            console.log(graphData)

            stockChart = new Chart(
                $(".graph-container"),
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
                            yAxes: [{
                                ticks: {
                                    fontColor: "blue"
                                }
                            }],
                            xAxes: [{
                                type: 'time',
                                distribution: 'series',
                                bounds: 'data',
                                ticks: {
                                    fontColor: "blue",
                                    source: 'data',
                                    display: true //set to false to remove x axis labels
                                }
                            }]
                        }
                    }
                });

            renderGraph(stockChart, graphLabels['1M'], graphData['1M']);
            $(".time-button:contains('1M')").addClass('graph-select');
            $(".graph").addClass('load');
        })
});




function handleGraph() {
    $('.time-button').on('click', function (event) {
        $('.time-button').removeClass('graph-select');
        let timeScale = $(this).text();
        $(this).addClass('graph-select');

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
$('document').ajaxStop(()=>{
    $.fancybox.open({
        src:'#lightbox-container',
        type:'inline',
        opts:{
            afterShow:function(instance,current){
                //console.info('show recipe details in modal!')
            }
        }
    });
})

//save to portfolio




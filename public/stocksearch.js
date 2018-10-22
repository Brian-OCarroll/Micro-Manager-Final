/*********** display stock search results *************/
let stockChart;
let graphLabels;
let graphData;
const jwtAuth = localStorage.getItem("token");
$('body').on('click', '.form-submit-button', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // save form search data to localStorage
    let symbol = $('.search-query').val();

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
    let myData;
    $.ajax(options)
        .fail(function (data) {
            // console.log(data)
            $('.searchSummary').html('Stock could not be found')
            $('.graph').hide()
        })
        .then(function (data) {
            myData = data
            console.log(data[0])
            $('.graph').show();
            let html = `
        <div class="results">
            <img class="comp-img"src="${data[0].companyImage}" alt="${data[0].symbol} parent company" width="42">
            <p class="symbol"  data-symbol="${data[0].symbol}">${data[0].symbol}</p>
            <p class="parent-comp" data-company="${data[0].parentCompany}">${data[0].parentCompany}</p> 
            <p class="company-description" data-description="${data[0].companyDescription}">${data[0].companyDescription}</p>
            <p class="closing" data-symbol="${data[0].close}">Close: ${data[0].close}</p>
            <p class="dayhigh" data-high="${data[0].high}">High: ${data[0].high}</p>
            <p class="daylow" data-low="${data[0].low}">Low: ${data[0].low}</p>
            <p class="yearhigh" data-thigh="${data[0].thigh}">52 Week High: ${data[0].thigh}</p>
            <p class="yearlow" data-tlow="${data[0].tlow}">52 Week Low: ${data[0].low}</p>
            <div class="save-portfolio-form">
                <p>save to portfolio</p>
                <button class="save-portfolio-button">Save Here</button>
            </div>
        </div>
        `;
            // let html2 = `       
            // <p>save to portfolio</p>
            // <button type="submit" class="save-portfolio-button">Save Here</button>
            // `
            $('.searchSummary').html(html);
            // $('.add-to-portfolio').html(html2)
            return;
        })
        .then(function(data) {
            console.log(data)
            // let metaData = data["Meta Data"]
            // let symbol = metaData["2. Symbol"]

            //the main object with all dates by day
            // let fullData = data[stockDay.json];
            let fullData = myData[1]["Time Series (Daily)"];
            console.log(fullData)
            let arrayData = [];
            function fixKeys(obj) {
                Object.keys(obj).forEach(function(key) {
                    let newName = key.split('.')[1].trim();
                    obj[newName] = obj[key];
                    delete obj[key];
                });
                return obj;
            }
            // adds a key value pair for the date, with the date of the stock quote, 
            Object.keys(fullData).map(function (key) {
                let obj = {};
                obj = fixKeys(fullData[key]);
                obj['date'] = key;
                arrayData.push(obj);
            });
            console.log(arrayData)
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
        .done(function() {
            console.log(graphLabels)
            console.log(graphData)

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

//save to portfolio

$('.searchSummary').on('click', '.save-portfolio-button', function (e) {
    e.preventDefault();
    //find user
    
    let symbol = $('.results').find('p').attr('data-symbol');
    let company = $('.results').find('.parent-comp').html();
    let description = $('.results').find('.company-description').html();
    let imageUrl = $('.results').find('img').attr('src');

    
    $.ajax('/users/checkuser', {
        headers: {
          'Authorization': `Bearer ${jwtAuth}`,
        }
    })
    .then((data, txtStatus, jqXHR) => {
        $.ajax({
            url: "/portfolio",
            method: "POST",
            headers: { Authorization: `Bearer ${jwtAuth}` },
            contentType: "application/json",
            data: JSON.stringify({
                name: company,
                description: description,
                image: imageUrl,
                symbol: symbol,
                user:data.id
            })
        }) 
        window.location.reload();  
    })
    .catch(function(err){
        alert(err);
    })
});


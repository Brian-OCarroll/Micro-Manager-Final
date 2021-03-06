/*********** display stock search results *************/
let stockChart;
let graphLabels;
let graphData;
const jwtAuth = localStorage.getItem("token");
$('main').on('submit', '.search-form', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // save form search data to localStorage
    let symbol = $('.search-query').val();
    const options = {
        url: '/stockpull',
        type: 'GET',
        beforeSend: function(){
            $('.ajax-loader').css("visibility", "visible");
        },
        cache: true,
        contentType: "application/json; charset=utf-8",
        data: {
            symbol: symbol
        },
        dataType: 'json'
    };
    const options2 = {
        url: '/stockpull/company',
        type: 'GET',
        cache: true,
        contentType: "application/json; charset=utf-8",
        data: {
            symbol: symbol
        },
        dataType: 'json'
    };
    let companyData;
    $.ajax(options2)
        .then(function (data) {
            companyData = data;
        })
        .fail(function (data) {
            $('.searchSummary').html('Stock could not be found')
            $('.graph').hide()
        })
    $.ajax(options)
        .then(function (data) {

            function fixKeys(obj) {
                Object.keys(obj).forEach(function (key) {
                    let newName = key.split('.')[1].trim();
                    obj[newName] = obj[key];
                    delete obj[key];
                });
                return obj;
            }
            let arrayData = data

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
            todayData['parentCompany'] = companyData["companyName"];
            todayData['companyDescription'] = companyData["description"];
            todayData['companyImage'] = companyData["image"];
            let html = `
        <div class="results">
            <img src="${todayData.companyImage}" alt="${todayData.symbol} parent company" >
            <div class="company-info">
            <p class="symbol"  data-symbol="${todayData.symbol}">${todayData.symbol.toUpperCase()}</p>
            <p class="parent-comp" data-company="${todayData.parentCompany}">${todayData.parentCompany}</p> 
            </div>
            <p class="company-description" data-description="${todayData.companyDescription}">${todayData.companyDescription}</p>
            <p class="closing" data-symbol="${todayData.close}"><strong>Close:</strong> ${todayData.close}</p>
            <p class="dayhigh" data-high="${todayData.high}"><strong>High:</strong> ${todayData.high}</p>
            <p class="daylow" data-low="${todayData.low}"><strong>Low:</strong> ${todayData.low}</p>
            <p class="yearhigh" data-thigh="${todayData.thigh}"><strong>52 Week High:</strong> ${todayData.thigh}</p>
            <p class="yearlow" data-tlow="${todayData.tlow}"><strong>52 Week Low:</strong> ${todayData.low}</p>
            <div class="save-portfolio-form">
                <button class="save-portfolio-button">Save To Portfolio</button>
            </div>
        </div>
        `;
            $('.searchSummary').html(html);
            $('.graph').show();
        })
        .done(function (data) {
            $('.ajax-loader').css("visibility", "hidden");
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
        .fail(function (data) {
            $('.searchSummary').html('Stock could not be found')
            $('.graph').hide()
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

//save to portfolio

$('.searchSummary').on('click', '.save-portfolio-button', function (e) {
    e.preventDefault();
    //find user obj_id

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

           return $.ajax({
                url: "/portfolio",
                method: "POST",
                headers: { Authorization: `Bearer ${jwtAuth}` },
                contentType: "application/json",
                data: JSON.stringify({
                    name: company,
                    description: description,
                    image: imageUrl,
                    symbol: symbol,
                    user: data.id
                })
            })
        })
        .then((response)=>{
            window.location.reload();
        })
        .catch(function (err) {
            alert('Stock already Saved')
            return;
        })
});

$(document).ready(function(){
    $("#search").focus(function() {
      $(".search-box").addClass("border-searching");
      $(".search-icon").addClass("si-rotate");
    });
    $("#search").blur(function() {
      $(".search-box").removeClass("border-searching");
      $(".search-icon").removeClass("si-rotate");
    });
    $("#search").keyup(function() {
        if($(this).val().length > 0) {
          $(".go-icon").addClass("go-in");
        }
        else {
          $(".go-icon").removeClass("go-in");
        }
    });
    $(".go-icon").click(function(){
      $(".search-form").submit();
    });
});

function truncateString(string, cutoffIndex) {
    if ( string.length <= cutoffIndex ) {
        return string
    }
    string.slice(0, cutoffIndex) + '...'
}
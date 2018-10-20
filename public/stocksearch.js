/*********** display stock search results *************/
let initData = [{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[123,145,134,167,189]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,146,161,164,175]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,23,156,89,75]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,123,101,84,55]}];
let stockChart;
let loopGraph;
let i=1;
let graphLabels;
let graphData;
const jwtAuth = localStorage.getItem("token");
$('body').on('click', '.form-submit-button', function (e) {
    e.stopPropagation();
    e.preventDefault();
    // save form search data to sessionStorage
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
    $.ajax(options)
        .then(function (data) {
            // console.log(data)
            let html = `
        <div class="results">
            <img src="${data.companyImage}" alt="${data.symbol} parent company" height="42" width="42">
            <p class="symbol"  data-symbol="${data.symbol}">${data.symbol}</p>
            <p class="parent-comp" data-company="${data.parentCompany}">${data.parentCompany}</p> 
            <p class="company-description" data-description="${data.companyDescription}">${data.companyDescription}</p>
            <p class="closing" data-symbol="${data.close}">Close: ${data.close}</p>
            <p class="dayhigh" data-high="${data.high}">High: ${data.high}</p>
            <p class="daylow" data-low="${data.low}">Low: ${data.low}</p>
            <p class="yearhigh" data-thigh="${data.thigh}">52 Week High: ${data.thigh}</p>
            <p class="yearlow" data-tlow="${data.tlow}">52 Week Low: ${data.low}</p>
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
            console.log(fullData);
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
            renderGraph(stockChart, graphLabels['1M'], graphData['1M']);
            $(".time-button:contains('1M')").addClass('graph-select');
            $(".graph").addClass('load');

            
        })
});

function initGraph(){

    stockChart = new Chart(
			$(".chart-js"),
			{"type":"line",
				"data":{"labels":initData[0].date, //array of labels
					"datasets":[
						{"label":"Symbol",
							"data":initData[0].data, //array of data
							"fill":false,
							"borderColor":"rgb(214, 51, 51)",
							"lineTension":0.1}
							]},
				"options":{
			        elements:{
			          point:{
			              radius: 0
                      }
                    },
					legend:{
						display: false
					},
					scales:{
			            yAxes:[{
			               ticks:{
			                   fontColor:"blue"
                           }
                        }],
						xAxes:[{
						    type: 'time',
                            distribution: 'series',
                            bounds: 'data',
							ticks: {
						        fontColor:"blue",
                                source: 'data',
						        display: true //set to false to remove x axis labels
                            }
						}]
					}}
			});
}

function handleGraph(){
    $('.time-button').on('click',function(event){
        $('.time-button').removeClass('graph-select');
        let timeScale = $(this).text();
        $(this).addClass('graph-select');

        renderGraph(stockChart,graphLabels[timeScale],graphData[timeScale]);
    });
}
function hideGraph(){
    $(".graph").removeClass('load');
}

function renderGraph(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets.forEach((dataset) => {
    	dataset.data = data;
    });
    chart.update();
}
function splashIntro(){
    $(".price-text").addClass('load');
    initGraph();
    $(".graph").addClass('load');
    $(".company-info").addClass('load');
    // loopGraph = setInterval(introGraph,6000);
}
function introGraph(){
    renderGraph(stockChart,initData[i].date,initData[i].data);
        i++;
        if(i>=initData.length){
            i=0;
        }
}
function handlePage(){
	splashIntro();
	handleGraph();
}
$(handlePage);

//save to portfolio

$('.searchSummary').on('click', '.save-portfolio-button', function(e) {
    e.preventDefault();
    if (localStorage.getItem("cardlist-id") != null) {
        return;
  }
    //find user
    console.log('Hello');
    if (jwtAuth == null) {
        alert(`Please login before you save a list`);
        return;
  }
    let symbol=$('.results').find('p').attr('data-symbol');
    let company=$('.results').find('.parent-comp').html();
    let description=$('.results').find('.company-description').html();
    let imageUrl=$('.results').find('img').attr('src');

    
    $.ajax({
        url: "/portfolio",
        method: "POST",
        headers: { Authorization: `Bearer ${jwtAuth}` },
        contentType: "application/json",
        data: JSON.stringify({
          name: company,
          description: description,
          image: imageUrl,
          symbol: symbol
        })
      });
      window.location.reload();
    
});


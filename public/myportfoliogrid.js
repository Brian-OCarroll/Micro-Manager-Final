(async function() {
    // Access user's id established in with token
    // Access User's cardlist based on their obj_id
    let portfolio = await $.ajax({
      url: `/portfolio/`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      contentType: "application/json"
      
    });
  //change to portfolio = user.portfolio
  if(portfolio.length>0){
   let portfolioList =  portfolio.map(list => ({
        name: list.name,
        id: list.id,
        image: list.image,
        description: list.description,
        symbol: list.symbol
    }));
  
    //displays the user's lists
    function displayLists(lists) {
      const htmllist = lists.map(
        list => `
            <div class="clickable-cards my-grid is-grid ${list.symbol}">
            <div class="ajax-loader" style="display: none;">
            <p>Loading Quote</p>
            <img src="../ajax-loader2.gif" alt="loading-gif" class="img-responsive" />
            </div>
            <img style="grid-area:img; " class="comp-img flexcard" src="${list.image}" alt="${list.symbol} Parent Company">
        
            <p class="stock-name "style="grid-area: name; ">${list.name}</p>
            <p class="stock-symbol"style="grid-area: symbol; ">${list.symbol.toUpperCase()}</p>
        
            <p class="description flexcard" style="grid-area: des; ">${truncateString(list['description'], 150)}</p>
        
            <button data-id="${list.id}" style="grid-area:del" class="delete-list port-button">Delete Stock</button>
            <button data-symbol="${list.symbol}" style=" grid-area: quo" class="expand port-button">Get realtime stock quote</button>
        
        </div>
            `
      );
      
      $("#my-lists").html(htmllist);
  
      //Delete List Button
      $(".delete-list").click(e => {
        e.preventDefault();
        let list = e.currentTarget;
        let list_id = $(list).data("id");
        $.ajax({
          url: `/portfolio/${list_id}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "DELETE",
          contentType: "application/json",
          success: function(){
            $(list)
            .parent()
            .css("display", "none");
          }
        });
      });
    }
    displayLists(portfolioList);
  }else{
    let message = '<h1 class="before-stocks">Try adding some stocks first!</h1>'
      $('#my-lists').html(message)
  }
  })();

  function truncateString(string, cutoffIndex) {
    if ( string.length <= cutoffIndex ) {
        return string
    }
    return string.slice(0, cutoffIndex) + '...'
}
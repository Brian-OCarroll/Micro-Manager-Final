(async function() {
    // Access user's id established in index.js
    // let user_id = localStorage.getItem("user_id");
    // Access User's cardlist based on their id
    let portfolio = await $.ajax({
      url: `/portfolio/`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      contentType: "application/json"
      
    });
    console.log(portfolio)
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
            <div class="clickable-cards ${list.symbol}"> 
            <div class="ajax-loader" style="display: none;">
                <p>Loading Quote</p>
                <img src="../ajax-loader2.gif" alt="loading-gif" class="img-responsive" />
            </div>
            <img class="comp-img flexcard" src="${list.image}" alt="${list.symbol} Parent Company">
            <div class="stock-name flexcard" >
              <p>${list.name}</p>
              <p>${list.symbol.toUpperCase()}</p>
            </div>
            <p class="description flexcard">${list.description}</p>
            
            <button data-id="${list.id}" class="delete-list port-button">Delete Stock</button>
            <button data-symbol="${list.symbol}"class="expand port-button">Get realtime stock quote</button>
            
          </div>
            `
      );
      
      $("#my-lists").html(htmllist);
  
      //Edit List Button
    //   $(".edit-list").click(e => {
    //     e.preventDefault();
    //     let list = e.currentTarget;
    //     let list_id = $(list).data("id");
    //     localStorage.setItem("cardlist-id", list_id);
    //     window.location.replace("/index.html");
    //   });
  
      //Delete List Button
      $(".delete-list").click(e => {
        e.preventDefault();
        let list = e.currentTarget;
        let list_id = $(list).data("id");
        console.log(list_id)
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
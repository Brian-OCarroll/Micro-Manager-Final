(async function() {
    // Access user's id established in index.js
    let user_id = localStorage.getItem("user_id");
  
    // Access User's cardlist based on their id
    let user = await $.ajax({
      url: `/users/${user_id}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      contentType: "application/json"
    });
  //change to portfolio = user.portfolio
    let portfolio = user.portfolio;
  
   let portfolioList =  portfolio.map(list => ({
        name: list.name,
        id: list._id,
        image: list.image,
        description: list.description,
        symbol: list.symbol
    }));
  
    //displays the user's lists
    function displayLists(lists) {
      const htmllist = lists.map(
        list => `
            <div class="clickable-card">
            <h1>${list.name}</h1>
            <button data-id="${
                list.id
              }" class="delete-list">Delete Stock
            </button>
            <div class="portfolio">
              <img src="${list.image}" alt="${list.symbol} Parent Company"  height="42" width="42">
              <p>${list.symbol}</p>
              <p>${list.description}</p>
            </div>
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
        $.ajax({
          url: `/portfolio/${list_id}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "DELETE",
          contentType: "application/json"
        });
        $(list)
          .parent()
          .css("display", "none");
      });
    }
  
  
  
    
  
  
    displayLists(portfolioList);
  })();
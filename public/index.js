
$(document).ready(function () {
    $('.tab a').on('click', function (e) {
      e.preventDefault();
      $(this).parent().addClass('active');
      $(this).parent().siblings().removeClass('active');
      var href = $(this).attr('href');
      $('.forms > form').hide();
      $(href).fadeIn(500);
    });
  });
  
  //listen for signup
  
  $('#signup').on('click', function(e) {
    // e.stopPropogation();
    e.preventDefault();
    //add class
    let username = $('[name="username"]').val();
    let password = $('[name="pass"]').val();
    let checkPass = $('[name="checkpass"]').val();
    if (password !== checkPass) {
      alert('Passwords do not match!');
      return;
    }
    //call server to create account
    const options= {
      url:'/users',
      type: 'POST',
      contentType: "application/json; charset=utf-8",
      dataType:'json',
      data:JSON.stringify({
        username,
        password
      })
    };
  
    $.ajax(options)
    .then(function(data) {
      console.log('User registration succeeded');
      return data;
    })
    .then(function(data){
      const options2={
        url:'/auth/login',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({
          username,
          password
        })
      };
  
      $.ajax(options2)
      .then(function(loginData){
        //what the hell this do????????
        localStorage.setItem("token", token.authToken);
        localStorage.setItem("user_id", token.user);
        window.location.replace("./stocksearch.html");
      })
      .catch(err => {
        if (err.responseJSON.message) {
          alert(err.responseJSON.message);
          return;
        }
        else{
          alert('Internal Server Error');
          return;
        }
      })
    })
    .catch(err => {
      console.log(err);
      if(err.responseJSON.message){
        alert(err.responseJSON.message);
        return;
      }
      else{
        alert('Internal Server Error');
        return;
      }
    });
  });
  
  
  //listen for login
  $('#login').on('click', function(e) {
    // e.stopPropogation();
    e.preventDefault();
    let username = $('[name="loguser"]').val();
    let password = $('[name="logpass"]').val();
    //call server login
    const options = {
      url: '/auth/login',
      type: 'POST',
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        "username": username,
        "password": password
      })
    };
  
    $.ajax(options)
    .then(function(data) {
      //console.log('user login succeeded');
  
      console.log(token.authToken);
      localStorage.setItem("token", token.authToken);
      localStorage.setItem("user_id", token.user);
      window.location.replace("./stocksearch.html");
    })
    .catch(err=>{
          console.log(err);
          if(err.status===401){
        alert("Username or Password is not correct");
        return;
          }
    })
  });
  
  
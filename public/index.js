"use strict";

// Listener for Login
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


$("#Login").click(e => {
  e.preventDefault();
  let username = $('[name="loguser"]').val().trim();
  let password = $('[name="logpass"]').val();
  if (username === "") {
    alert(`Please enter valid username`);
    return;
  }
  if (password === "") {
    alert(`Please enter a valid password`);
    return;
  }

  try{
  (async () => {
    let token = await $.ajax({
      url: "/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password
      })
    })
    localStorage.setItem("token", token.authToken);
    window.location.replace("/stocksearch.html");
  })();
  }catch(error){
    console.log(JSON.stringify(error))
    alert('Username or Password Incorrect')
  }
});

// Listener of Signup

$("#Signup").click(e => {
  e.preventDefault();
  let username = $('[name="username"]').val().trim();
  let password = $('[name="pass"]').val();
  let cpassword = $('[name="checkpass"]').val();
  if (password !== cpassword) {
    alert(`Please make sure your passwords match!`);
    return;
  }
  if (password === "" || cpassword === "") {
    alert(`Please enter a password and confirm it`);
    return;
  }
  if (username === "") {
    alert(`Please enter valid email`);
    return;
  }

  //Create New User Request
  (async () => {
    try{
    await $.ajax({
      url: "/users",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password
      })
    });
    let token = await $.ajax({
      url: "/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password
      })
    });
    localStorage.setItem("token", token.authToken);
    window.location.replace("/stocksearch.html");
  }catch(err){
    alert(err);
  }
  })();
});

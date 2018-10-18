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
  let username = $('[name="loguser"]').val();
  let password = $('[name="logpass"]').val();
  if (username === "") {
    alert(`Please enter valid username`);
    return;
  }
  if (password === "") {
    alert(`Please enter a valid password`);
    return;
  }
  (async () => {
    let token = await $.ajax({
      url: "/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password
      })
    });
    console.log(token.authToken);
    localStorage.setItem("token", token.authToken);
    localStorage.setItem("user_id", token.user);
    window.location.replace("/stocksearch.html");
  })();
});

// Listener of Signup

$("#Signup").click(e => {
  e.preventDefault();
  let username = $('[name="username"]').val();
  let password = $('[name="pass"]').val();
  let cpassword = $('[name="checkpass"]').val();
  if (password !== cpassword) {
    alert(`Please match sure your passwords match!`);
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
    await $.ajax({
      url: "/users",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password
      }),
      error: function(err) {
        console.log(`Error!`, err);
      }
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
    localStorage.setItem("user_id", token.user);
    window.location.replace("/stocksearch.html");
  })();
});
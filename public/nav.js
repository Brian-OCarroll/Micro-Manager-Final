"use strict";

// Dynamic Nav for pages
function loadNav() {
  let url = window.location.href.split("/").pop();

  let user_id = localStorage.getItem("user_id");
  $(".nav-bar").html(`<ul class='cf'>
        ${
          user_id != null
            ? `
          <li>
            <a class="login out" href="./index.html">
              Log Out
            </a>
          </li>`
            : ` <li>
          <a class="login" href="./index.html">
            Log In
          </a>
        </li>`
        }
        ${
          url != "stocksearch.html"
            ? `
        <li>
            <a href='./stocksearch.html'>Stock Search</a>
        </li>`
            : ""
        }
        ${
          url != "myportfolio.html"
            ? `
            <li>
                <a href='./myportfolio.html'>Portfolio</a>
            </li>`
            : ""
        }
        </ul>
        <a href="#" id="openup">Menu</a>`);

  $(".login.out").click(() => {
    localStorage.clear();
    window.location.replace("/index.html");
  });
}
loadNav();
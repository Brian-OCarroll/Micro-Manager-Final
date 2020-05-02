# Micro Manager

This app allows you to search and store stock information as well as get realtime/historical stock info 
with 5 years of trends shown using chart.js.

## Documentation
The landing page allows you to log in or create a new profile with a username and password. From there 
stocks can be searched by ticker symbols and a realtime stock quote and trend graph is rendered. From there
basic stock info can be saved to your portfolio with a button click if logged in. If not logged in, the user
will be redirected to the login screen. The porfolio page displays all stocks saved to your portfolio. From there
a user can either get a realtime quote, rendered in a lightbox, or delete saved stocks with the click of a button

## API Documentation
Endpoints on the server side include:
### '/' - index page
#### GET '/'
No data required in request. Render the index page.
### '/users' - user registration
#### POST '/'
"username" and "password" are required in request body. Both parameters cannot start or end with white space, and password must be at least 4 characters and at most 72 characters long.
### '/auth' - user authentication
#### POST '/login'
Authentication of user login.
### '/stockpull' - stock quotes current/historical
This endpoint will call a third-party api for stock searches. 
Request query must supply the following:

* symbol - the stock ticker symbol of the company

#### GET '/'
This endpoint returns daily time series (date, daily open, daily high, daily low, daily close, daily volume) of the global equity specified, covering 20+ years of historical data.
### '/stockpull/company'
This endpoint will call a third-party api for company info. 
Request query must supply the following:

* symbol - the stock ticker symbol of the company

#### GET '/'
Returns relavent company data including parent name, website, industry, CEO name, an image of the parent company logo, and a small description.
### '/portfolio/'
This endpoint displays protected info about the users saved stock portfolio. User must login to access.
#### GET '/'
Returns all the users saved stocks.
#### GET '/:id'
Returns a specific saved stock.
#### POST '/'
Request body supplies a name, symbol and description.
#### DELETE '/:id'
Request body supplies a stock id to delete.

## Live App 

- [Live App](https://micro-manager.brianocarroll.dev)

### Demo Login (no caps)

Username: demo

Password: pass

## Screenshots
Signup/Login Page:

![Signup tab](images/signup.png)

![Login tab](images/login.png)

Stock Search Page:

![search page 1](images/stocksearch1.png)

![search page 2](images/stocksearch2.png)

My Portfolio Page:

![My Portfolio page 1](images/myportfolio1.png)

![My Portfolio page 2](images/myportfolio2.png)

## Created Using

* HTML
* CSS
* Javascript
* jQuery
* node.js
* Express
* Mongoose
* MongoDB


## Author

* **Brian O'Carroll** 
* **bocarroll36@gmail.com**

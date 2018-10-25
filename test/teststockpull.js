const routeToTest='/stockpull';
const routeToTest1='/stockpull/company';
const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
chai.use(chaiHttp);
const expect = chai.expect;
const {ALPHA_KEY1} = require('../config');

describe('test stockpull endpoint',function(){

  describe('GET / endpoint', function() {
		it('should return 200 status code', function() {
			let res;
			return chai.request(app)
            .get(routeToTest)
            .set('apikey', ALPHA_KEY1)
            .set('symbol','googl')
      .then(function(_res) {
        res = _res;
        expect(res).to.have.status(200);
			})
		});
  });
	
}); 
/**
 *  Unit Tests for the auth plugin /authenticate route
 *  
 *  to run tests go to auth directory and run command 'mocha'
 */

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
var request = require('supertest');

chai.use(chaiHttp);

const url = 'http://localhost:1234';

//user that exists in the database
const testUser = {
		username: "test",
		password: "password"
};


//user that does not exist in the database
const invalidUser = {
		username: "invalid",
		password: "password"
};



describe('auth', () => {
	
	describe('POST authenticate', () => {
		
		
		//authenticate with valid credentials
		it('it should return a valid jwt if valid username and password are given' , (done) => {
			chai.request(url)
				.post('/authenticate')
				.auth(testUser.username, testUser.password)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('isValid');
					res.body.isValid.should.eql(true);
					res.body.should.have.property('credentials');
					res.body.credentials.should.have.property('access_token');
						
					done();
				});
		});
		
		
		
		//authenticate with invalid credentials
		it('it should return a Forbidden HTTP response if invlid username or password is given' , (done) => {
			chai.request(url)
				.post('/authenticate')
				.auth(invalidUser.username, invalidUser.password)
				.end((err, res) => {
					res.should.have.status(403);
					res.body.should.be.a('object');
					res.body.should.have.property('isValid');
					res.body.isValid.should.eql(false);
					res.body.should.have.property('errors');
					
								
					done();
				});
		});
		
		
		
		//authenticate with missing password
		it('it should return a 401 Unauthorized response if no username is given' , (done) => {
			chai.request(url)
				.post('/authenticate')
				.auth("", invalidUser.password)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('statusCode');
					res.body.statusCode.should.eql(401);
					res.body.should.have.property('error');
					res.body.should.have.property('message');
							
										
					done();
				});
		});
		
		
		
		//authenticate with missing password
		it('it should return a 401 Unauthorized response if no password is given' , (done) => {
			chai.request(url)
				.post('/authenticate')
				.auth(invalidUser.username, "")
				.end((err, res) => {
					res.should.have.status(403);
					res.body.should.be.a('object');
					res.body.should.have.property('errors');
												
					done();
				});
		});
		
	});
	
});
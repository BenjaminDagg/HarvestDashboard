/*
	Unit tests for harvest api
	
	To run tests type 'mocha' in harvest-service directory
*/

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var request = require('supertest');

chai.use(chaiHttp);

const url = 'http://localhost:2000';

const testUser = {
		username: "test",
		password: "password",
		firstname: "firstname",
		lastname: "lastname",
		id: "5abc5cfb73db43393856e365",
		createdAt: "2018-02-28"
};


var token = null;



describe('harvest api', () => {
	
	before((done) => {
		chai.request(url)
		.post('/authenticate')
		.auth(testUser.username, testUser.password)
		.end((err, res) => {
			
			token = res.body.credentials.access_token;
			done();
		});
	});
	
	
	/* =============== GET /users =================================== */
	describe('/GET users', () => {
		
		//get users
		it('it should get all users' , (done) => {
			chai.request(url)
				.get('/users')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.should.not.be.empty;
					done();
				});
		});
	
	});

});
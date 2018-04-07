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
	describe('/GET /harvest/numcrates', () => {
	
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=03312018')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return Unauthorized if an invalid bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=03312018')
				.set('authorization', 'Bearer' + "eyJhbGciOiJaUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmM1Y2ZiNzNkYjQzMzkzODU2ZTM2NSIsImlhdCI6MTUyMjMwNDAxOCwiZXhwIjoxNTIyMzkwNDE4fQ.o6iXFxiTDUu_JWy4AVmasO7Ue6IIH6h5FZkCBCkhj0c")
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return an error as there is no date parameter' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
		it('it should return an error as there is an invalid date parameter' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=033120188')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
		it('it should return a list of all crates for all users for 03/31/2018' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=03312018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					done();
				});
		});
		it('it should return a list of all crates for a specific user for 03/31/2018' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=03312018&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					done();
				});
		});
		
	
	});
	describe('/GET /harvest/meandist', () => {
		it('it should return the mean distance between crates for all users from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=03302018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
		it('it should return the mean distance between crates for a specific user from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=03302018&to=04012018&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
		
		
		
	});
	describe('/GET /harvest/meantime', () => {
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=03302018&to=04012018')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return Unauthorized if an invalid bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=03302018&to=04012018')
				.set('authorization', 'Bearer' + "eyJhbGciOiJaUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmM1Y2ZiNzNkYjQzMzkzODU2ZTM2NSIsImlhdCI6MTUyMjMwNDAxOCwiZXhwIjoxNTIyMzkwNDE4fQ.o6iXFxiTDUu_JWy4AVmasO7Ue6IIH6h5FZkCBCkhj0c")
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return status code 400 since there is missing parameters' , (done) => {
			chai.request(url)
				.get('/harvest/meantime')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
		it('it should return the mean time for all user crates from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=03302018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.body.should.have.property('meantime');
					res.should.have.status(200);
					done();
				});
		});
		it('it should return the mean time for a specific users crates from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=03302018&to=04012018&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.body.should.have.property('meantime');
					res.should.have.status(200);
					done();
				});
		});
	
			
	
	});
	describe('/GET /harvest/numcrates/between', () => {
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=03302018&to=04012018')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return Unauthorized if an invalid bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=03302018&to=04012018')
				.set('authorization', 'Bearer' + "eyJhbGciOiJaUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmM1Y2ZiNzNkYjQzMzkzODU2ZTM2NSIsImlhdCI6MTUyMjMwNDAxOCwiZXhwIjoxNTIyMzkwNDE4fQ.o6iXFxiTDUu_JWy4AVmasO7Ue6IIH6h5FZkCBCkhj0c")
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return an error as there is no parameters' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
		it('it should return a list of crates for all users for crates from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=03302018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					res.body.should.have.property('cratesPerDay');
					done();
				});
		});
		it('it should return a list of crates for a specific user for crates from 03/31/2018 to 04/01/2018' , (done) =>
		{
			chai.request(url)
				.get('/harvest/numcrates/between?from=03302018&to=04012018&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					res.body.should.have.property('cratesPerDay');
					done();
				});
		});
	

	});

});
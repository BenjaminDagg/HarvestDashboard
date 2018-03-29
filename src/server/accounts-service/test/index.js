/**
 * Unit tests for accounts-service api
 * 
 * Run tests by running command 'mocha' in 'accounts-service' directory
 */

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var request = require('supertest');

chai.use(chaiHttp);

const url = 'http://localhost:4200';

const testUser = {
	username: "test",
	password: "password",
	firstname: "firstname",
	lastname: "lastname"
};

const basic =  (testUser.username + ':' + testUser.password).toString('base64');


var token = null;

/*
Testing users-service
*/
describe('users', () => {
	
	before((done) => {
		chai.request(url)
		.post('/authenticate')
		.auth(testUser.username, testUser.password)
		.end((err, res) => {
			
			token = res.body.credentials.access_token;
			done();
		});
	});
	
	
	// get /user
	describe('/GET users', () => {
		
		//get users
		it('it should get all users' , (done) => {
			chai.request('http://localhost:4200')
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
		
		//get users?firstname=exists
		it('it should get all users with a specified firstname if it exists ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?firstname=' + testUser.firstname)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					var users = res.body.users;
					for (var i = 0; i < users.length;i++) {
						users[i].should.have.property('_id');
						users[i].should.have.property('username');
						users[i].should.have.property('password');
						users[i].should.have.property('firstname');
						users[i].should.have.property('lastname');
						users[i].should.have.property('createdAt');
					
						users[i].firstname.should.eql(testUser.firstname);
					}
					done();
				});
		});
		
		//get users?firstname=doesnt_exist
		it('it should return an empty list when the username doest exist ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?firstname=doesnt_exist')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.length.should.be.eql(0);
					done();
				});
			
		});
	
		
		
		
		// get users?lastname=exists
		it('it should get all users with a specified last name if it exists ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?lastname=' + testUser.lastname)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.should.not.be.empty;
							
					var users = res.body.users;
					for (var i = 0; i < users.length;i++) {
						users[i].should.have.property('_id');
						users[i].should.have.property('username');
						users[i].should.have.property('password');
						users[i].should.have.property('firstname');
						users[i].should.have.property('lastname');
						users[i].should.have.property('createdAt');
						
						users[i].lastname.should.eql(testUser.lastname);
					}
					done();
				});	
		});
		
		
		// get users?lastname=doest_exist
		it('it should return an empty list when the lastname doesnt exist ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?lastname=doesnt_exist')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.length.should.be.eql(0);
					done();
				});	
		});
		
		
		// get users?username=exists
		it('it should get all users with a specified username if it exists ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?username=' + testUser.username)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.should.not.be.empty;
					
					var users = res.body.users;
					for (var i = 0; i < users.length;i++) {
						users[i].should.have.property('_id');
						users[i].should.have.property('username');
						users[i].should.have.property('password');
						users[i].should.have.property('firstname');
						users[i].should.have.property('lastname');
						users[i].should.have.property('createdAt');
						
						users[i].username.should.eql(testUser.username);
					}
					done();
				});	
		});
		
		
		
		// get users?username=doest_exist
		it('it should return an empty list when the given username doesnt exist ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?username=doesnt_exist')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.length.should.be.eql(0);
					done();
				});	
		});
		
		
		
		// get users?limit=3
		it('it should limit the number of responses to a given limit parameter ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?limit=3')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.length.should.be.eql(3);
					done();
				});	
		});
		
		
		// get users?limit=100
		it('it should return all records if the given limit parameter is greater than the number of records ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?limit=100')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.should.not.be.empty;
					done();
				});	
		});
		
		
		
		// get users?limit=-1
		it('it should return a bad request if the given limit parameter is a negative value or zero ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?limit=-1')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					
					done();
				});	
		});
		
		
		
		// get users?lastname=doest_exist
		it('it should be able to search for users with a query and limit parameter ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?username=ben&limit=2')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.length.should.be.eql(2);
					
					var users = res.body.users;
					for (var i = 0; i < users.length;i++) {
						users[i].should.have.property('_id');
						users[i].should.have.property('username');
						users[i].should.have.property('password');
						users[i].should.have.property('firstname');
						users[i].should.have.property('lastname');
						users[i].should.have.property('createdAt');
						
						users[i].username.should.eql('ben');
					}
					done();
				});	
		});
		
		
		// get users?firstname=ben&username=ben
		it('it should be able to search for users with multiple query parameters ' , (done) => {
			chai.request('http://localhost:4200')
				.get('/users?username=ben&firstname=ben&limit=2')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('users');
					res.body.users.should.not.be.empty;
							
					var users = res.body.users;
					for (var i = 0; i < users.length;i++) {
						users[i].should.have.property('_id');
						users[i].should.have.property('username');
						users[i].should.have.property('password');
						users[i].should.have.property('firstname');
						users[i].should.have.property('lastname');
						users[i].should.have.property('createdAt');
								
						users[i].username.should.eql('ben');
						users[i].firstname.should.eql('ben');
					}
					done();
				});	
		});
		
		
	});
		
	
	
	
});
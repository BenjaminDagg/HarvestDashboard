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
	lastname: "lastname",
	id: "5abc5cfb73db43393856e365",
	createdAt: "2018-02-28"
};


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
		
		//get users?firstname=exists
		it('it should get all users with a specified firstname if it exists ' , (done) => {
			chai.request(url)
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
			chai.request(url)
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
			chai.request(url)
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
			chai.request(url)
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
			chai.request(url)
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
			chai.request(url)
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
		
		
		
		
		
		
		// get users?firstname=ben&username=ben
		it('it should be able to search for users with multiple query parameters ' , (done) => {
			chai.request(url)
				.get('/users?username=test&firstname=firstname')
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
						users[i].firstname.should.eql(testUser.firstname);
					}
					done();
				});	
		});
		
		
		
		//get users/{invalid_id}
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
		chai.request(url)
				.get('/users')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		
		//get users/{invalid_id}
		it('it should return Unauthorized if an invalid bearer token is given in the authorization header' , (done) => {
		chai.request(url)
				.get('/users')
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
		
		
		
		it('it should return 404 Bad request when an invalid query parameter is given ' , (done) => {
			chai.request(url)
				.get('/users?invalid=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					
					done();
				});	
		});
		
		
	});
	
	
	/* ================ GET /users/{id} ================================ */
	describe('GET users/{id}', () => {
		
		
		//get users/{valid_id}
		it('it should return info on a user when a valid id is given' , (done) => {
		chai.request(url)
				.get('/users/' + testUser.id)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('user');
					
					var user = res.body.user;
					user.should.have.property('_id');
					user.should.have.property('username');
					user.should.have.property('firstname');
					user.should.have.property('lastname');
					user.should.have.property('createdAt');
					
					user._id.should.eql(testUser.id);
					user.username.should.eql(testUser.username);
					user.firstname.should.eql(testUser.firstname);
					user.lastname.should.eql(testUser.lastname);
					user.createdAt.should.eql(testUser.createdAt);
					done();
				});
		});
		
		
		//get users/{invalid_id}
		it('it should return a bad request when an invalid id is given' , (done) => {
		chai.request(url)
				.get('/users/5abc5cfb73db43393856e36d')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		//get users/{malformed_id}
		it('it should return a bad request when a malformed id is given' , (done) => {
		chai.request(url)
				.get('/users/invalid_id')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		//get users/{invalid_id}
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
		chai.request(url)
				.get('/users/' + testUser.id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
				
				
				
				
		//get users/{invalid_id}
		it('it should return Unauthorized if an invalid bearer token is given in the authorization header' , (done) => {
		chai.request(url)
				.get('/users/' + testUser.id)
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
	});
	
	
	
	/* ================ POST /users/register ================================ */
	describe('POST users/register', () => {
				
		
		it('it should insert a new user object into the database when valid credenials are given' , (done) => {
		chai.request(url)
				.post('/users/register')
				.send({
					'username' : new Date(),
					'password' : 'password',
					'firstname' : 'firstname',
					'lastname' : 'lastname'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('messege');
					res.body.should.have.property('user');
					
					var user = res.body.user;
					user.should.have.property('username');
					user.should.have.property('password');
					user.should.have.property('firstname');
					user.should.have.property('lastname');
					user.should.have.property('createdAt');
					user.should.have.property('_id');
					
					
					
					done();
				});
		});
		
		
		
		it('it should return a Bad Request when no request body given' , (done) => {
			chai.request(url)
					.post('/users/register')
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request if lastname field missing in the body' , (done) => {
			chai.request(url)
			.post('/users/register')
			.send({
				'username' : new Date(),
				'password' : 'password',
				'firstname' : 'firstname'
			})
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.should.have.property('error');
						
				done();
			})
		});
		
		
		
		it('it should return a Bad Request if firstname field missing in the body' , (done) => {
			chai.request(url)
			.post('/users/register')
			.send({
				'username' : new Date(),
				'password' : 'password',
				'lastname' : 'lastname'
			})
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.should.have.property('error');
						
				done();
			})
		});
		
		
		
		it('it should return a Bad Request if password field missing in the body' , (done) => {
			chai.request(url)
			.post('/users/register')
			.send({
				'username' : new Date(),
				'firstname' : 'firstname',
				'lastname' : 'lastname'
			})
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.should.have.property('error');
						
				done();
			})
		});
		
		
		
		it('it should return a Bad Request if username field missing in the body' , (done) => {
			chai.request(url)
			.post('/users/register')
			.send({
				'password' : 'password',
				'firstname' : 'firstname',
				'lastname' : 'lastname'
			})
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.should.have.property('error');
						
				done();
			})
		});
		
		
		
		it('it should return a Bad Request if a user is already registered with the given username' , (done) => {
			chai.request(url)
			.post('/users/register')
			.send(testUser)
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.should.have.property('error');
						
				done();
			})
		});
	});
	
	
	
	/* ================ POST /users/login ================================ */
	describe('POST users/login', () => {
				
		
		it('it should return a user object in the body whwen valid user credentials given' , (done) => {
		chai.request(url)
				.post('/users/login')
				.set('authorization', 'Bearer' + token)
				.send({
					'username' : testUser.username,
					'password' : testUser.password
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('messege');
					res.body.should.have.property('data');
					res.body.data.should.have.property('user');
					
					var user = res.body.data.user;
					user.should.have.property('username');
					user.should.have.property('password');
					user.should.have.property('firstname');
					user.should.have.property('lastname');
					user.should.have.property('createdAt');
					user.should.have.property('_id');
					
					done();
				});
		});
		
		
		
		it('it should return a Bad Request when invalid username given' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.send({
						'username' : testUser.username + 'invalid',
						'password' : testUser.password
					})
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request when invalid password given' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.send({
						'username' : testUser.username,
						'password' : testUser.password + 'invalid'
					})
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request when invalid username and password given' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.send({
						'username' : testUser.username + 'invalid',
						'password' : testUser.password + 'invalid'
					})
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request when no request body given' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request when no username field given in body' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.send({
						'password' : testUser.password + 'invalid'
					})
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return a Bad Request when no password field given in body' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + token)
					.send({
						'username' : testUser.username
					})
					.end((err, res) => {
						res.should.have.status(400);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return Unauthorized when no bearer token is given in header' , (done) => {
			chai.request(url)
					.post('/users/login')
					.set('authorization', 'Bearer' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmM1Y2ZiNzNkYjkzMzkzODU2ZTM2NSIsImlhdCI6MTUyMjU0ODk3MCwiZXhwIjoxNTIyNjM1MzcwfQ.W6kdOlsR6-G9o-VIyUfa8StBRfrVj7WwNJCOBlMeJws')
					.send({
						'username' : testUser.username,
						'password' : testUser.password
					})
					.end((err, res) => {
						res.should.have.status(401);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
		
		
		
		it('it should return Unauthorized when invalid bearer token is given in header' , (done) => {
			chai.request(url)
					.post('/users/login')
					.send({
						'username' : testUser.username,
						'password' : testUser.password
					})
					.end((err, res) => {
						res.should.have.status(401);
						res.body.should.be.a('object');
						res.should.have.property('error');
						
						done();
			});
		});
	
	});
		
	
	
	
});
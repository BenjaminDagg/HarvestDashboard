/*
 * Unit Tests for maps-service api
 * 
 * To run tests type 'mocha' in maps-service directory
 */


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var request = require('supertest');

chai.use(chaiHttp);

const url = 'http://localhost:1234';

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
Testing maps-service
*/
describe('maps-service', () => {
	
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
	describe('/POST /maps', () => {
		
		
		
		it('it should add a map object to the database when given valid credentials' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'shape' : {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('messege');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when no request body is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when no type field is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.send({
					
					'name' : 'testmap',
					'shape' : {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when no name field is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.send({
					'type' : 'map',
					'shape' : {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when no shape field is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when no data field is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token)
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'shape' : {}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 Unauthorizaed when no bearer token is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'shape' : {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 Unauthorizaed when invalid bearer token is given' , (done) => {
			chai.request(url)
				.post('/maps')
				.set('authorization', 'Bearer' + token + 'invalid')
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'shape' : {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
	
	});
	
	
	
	describe('/GET /maps', () => {
		
		
		
		it('it should return a list of all maps in the database' , (done) => {
			chai.request(url)
				.get('/maps')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					
					
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/maps')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/maps')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
	
	});
	
	
	
	describe('/GET /maps/{id}', () => {
		
		
		
		it('it should return a map object of the given map id whne the id is valid' , (done) => {
			chai.request(url)
				.get('/maps/5ac05610a7b69a3b149003b9')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('map');
					
					var map = res.body.map;
					map.should.have.property('type');
					map.should.have.property('name');
					map.should.have.property('shape');
					map.should.have.property('createdAt');
					map.should.have.property('data');
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request when an invalid map id is given' , (done) => {
			chai.request(url)
				.get('/maps/5ac05610a7b69a3b149003b8')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request when a malformed map id is given' , (done) => {
			chai.request(url)
				.get('/maps/5ac05610a7b69a3b149003b')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/maps/5ac05610a7b69a3b149003b9')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/maps/5ac05610a7b69a3b149003b9')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});

	});
	
	
	
	describe('/GET /maps/user/{id}', () => {
		
		it('it should return an array of map objects of all of the maps for the given user id' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('type');
						res.body[i].should.have.property('name');
						res.body[i].should.have.property('shape');
						res.body[i].should.have.property('createdAt');
						res.body[i].should.have.property('data');
					}
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 bad request if user id does not exist' , (done) => {
			chai.request(url)
				.get('/maps/user/5abc5cfb73db43393856e366')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
				
					done();
				});
		});
		
		
		
		it('it should return an empty array if the user does not have any maps' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0)
					done();
				});
		});
		
		
		
		it('it should return 400 bad request if user id is malformed' , (done) => {
			chai.request(url)
				.get('/maps/user/5abc5cfb73db43393856e36')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		
		it('it should be able to filter a users maps to only get maps older than a certain date' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?from=03012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should be able to filter a users maps to only get maps newer than a certain date' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should be able to the search to only maps falling in a certain time frame' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?from=03282018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should return an empty array if no maps fall in the given time frame' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?from=04012018&to=04302018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
					done();
				});
		});
		
		
		
		it('it should return an empty array if the given time frame is invalid' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?from=04302018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/maps/user/5abc5cfb73db43393856e365')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/maps/user/5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
	});
	
	
	
	describe('/GET /scans', () => {
		
		it('it should return an of all scan objects when no query parameters given' , (done) => {
			chai.request(url)
				.get('/scans')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
								
					done();
				});
		});
		
		
		
		it('it should return a list of scans for a certain user when the id parameter is given' , (done) => {
			chai.request(url)
				.get('/scans?id=' + testUser.id)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request if the user id given does not exist' , (done) => {
			chai.request(url)
				.get('/scans?id=5abc5cfb73db43393856e362')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results to scnas after a specified date' , (done) => {
			chai.request(url)
				.get('/scans?from=03012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results to scnas before a specified date' , (done) => {
			chai.request(url)
				.get('/scans?to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results scans within a certain time frame' , (done) => {
			chai.request(url)
				.get('/scans?from=03312018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
		
		
		it('it should return an empty array if an invlid time frame is given' , (done) => {
			chai.request(url)
				.get('/scans?from=04312018&to=03012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
					done();
				});
		});
		
		
		
		it('it should be able to get scans from a specific user within a time frame' , (done) => {
			chai.request(url)
				.get('/scans?id=' + testUser.id +'&from=03312018&to=04012018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					done();
				});
		});
		
	});
	
	
});
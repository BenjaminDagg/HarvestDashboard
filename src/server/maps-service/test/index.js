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
		createdAt: "2018-04-12T21:56:30.814Z"
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
					'name' : new Date().toString(),
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when any query parameter is given' , (done) => {
			chai.request(url)
				.post('/maps?query=invalid')
				.set('authorization', 'Bearer' + token)
				.send({
					'type' : 'map',
					'name' : 'testmap',
					'shape': {},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
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
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					
					done();
				});
		});
		
		
		
		it('it should by able to filter maps by id' , (done) => {
			chai.request(url)
				.get('/maps?id=5aa23113734d1d3717fd4c4f')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(1);
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					
					
					
					done();
				});
		});
		
		
		
		it('it should return an empty array when an invalid id is given' , (done) => {
			chai.request(url)
				.get('/maps?id=5aa23113734d1d3717fd4c4a')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);					
					
					done();
				});
		});
		
		
		
		it('it should return a bad request when a malformed id is given' , (done) => {
			chai.request(url)
				.get('/maps?id=5aa23113734d1d3717fd4c4')
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
		
		
		
		it('it should be able to filter maps after a given date' , (done) => {
			chai.request(url)
				.get('/maps?from=2018-03-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					
					done();
				});
		});
		
		
		
		it('it should be able to filter maps before a given date' , (done) => {
			chai.request(url)
				.get('/maps?to=2018-03-20')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					
					done();
				});
		});
		
		
		
		it('it should be able to filter maps in a given time frame' , (done) => {
			chai.request(url)
				.get('/maps?from=2018-03-01&to=2018-04-15')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					
					done();
				});
		});
		
		
		
		it('it should return an empty array when an invalid time frame is given' , (done) => {
			chai.request(url)
				.get('/maps?from=2018-05-01&to=2018-03-15')
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
				.get('/maps/5aa23113734d1d3717fd4c4f')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					
					res.body.should.have.property('type');
					res.body.should.have.property('name');
					res.body.should.have.property('shape');
					res.body.should.have.property('createdAt');
					res.body.should.have.property('_id');
					
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request when an invalid map id is given' , (done) => {
			chai.request(url)
				.get('/maps/5aa23113734d1d3717fd4c4a')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request when a malformed map id is given' , (done) => {
			chai.request(url)
				.get('/maps/5aa23113734d1d3717fd4c4')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request if any query parameters are given' , (done) => {
			chai.request(url)
				.get('/maps/5aa23113734d1d3717fd4c4f?query=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should an empty array if the user does not have any maps' , (done) => {
			chai.request(url)
				.get('/maps/user/5ad02ada415d0f27341bcfe2')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		
		it('it should be able to filter a users maps to only get maps older than a certain date' , (done) => {
			chai.request(url)
				.get('/maps/user/' + testUser.id +'?from=2018-01-01')
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
				.get('/maps/user/' + testUser.id +'?to=2018-04-14')
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
				.get('/maps/user/' + testUser.id +'?from=2018-01-01&to=2018-04-14')
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
				.get('/maps/user/' + testUser.id +'?from=2018-05-01&to=2018-05-02')
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
				.get('/maps/user/' + testUser.id +'?from=2018-05-01&to=2018-04-01')
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
		
		it('it should return an array of all scan objects when no query parameters given' , (done) => {
			chai.request(url)
				.get('/scans')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						res.body[i].location.coordinates.length.should.not.eql(0);
						
					}
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
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						res.body[i].location.coordinates.length.should.not.eql(0);
						
					}
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results to scnas after a specified date' , (done) => {
			chai.request(url)
				.get('/scans?from=2018-02-15')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						res.body[i].location.coordinates.length.should.not.eql(0);
						
					}
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results to scnas before a specified date' , (done) => {
			chai.request(url)
				.get('/scans?to=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						res.body[i].location.coordinates.length.should.not.eql(0);
						
					}
					done();
				});
		});
		
		
		
		it('it should be able to filter scan results scans within a certain time frame' , (done) => {
			chai.request(url)
				.get('/scans?from=2018-03-01&to=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						
						
					}
					done();
				});
		});
		
		
		
		it('it should return an empty array if an invlid time frame is given' , (done) => {
			chai.request(url)
				.get('/scans?from=2018-05-01&to=2018-01-01')
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
				.get('/scans?id=' + testUser.id +'&from=2018-03-01&to=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('_id');
						res.body[i].should.have.property('profileId');
						res.body[i].should.have.property('datetime');
						res.body[i].should.have.property('mapIds');
						res.body[i].should.have.property('scannedValue');
						res.body[i].should.have.property('location');
						res.body[i].location.should.be.a('object');
						res.body[i].location.should.have.property('type');
						res.body[i].location.should.have.property('coordinates');
						res.body[i].location.coordinates.should.be.a('array');
						res.body[i].location.coordinates.length.should.not.eql(0);
						
					}
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/scans')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/scans')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
	});
	
	
	
	describe('POST /scans', () => {
		
		it('it should add a new scan object to the scans database when valid credentils given' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'scannedValue' : 'scan',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					},
					'data' : {}
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					res.body.should.have.property('scan');
					
					var scan = res.body.scan;
					scan.should.have.property('_id');
					scan.should.have.property('profileId');
					scan.should.have.property('datetime');
					scan.should.have.property('mapIds');
					scan.should.have.property('location');
					scan.location.should.have.property('type');
					scan.location.should.have.property('coordinates');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when profileId field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					
					'mapIds' : [],
					'scannedValue' : 'scan',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when mapIds field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'scannedValue' : 'scan',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when scannedValue field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when location field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'scannedValue' : 'scan',
					'mapIds' : []
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when coordinates field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'scannedValue' : 'scan',
					'mapIds' : [],
					'location' : {
						'type' : 'scan'
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when type field is missing' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'location' : {
						
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when any query parameter is given' , (done) => {
			chai.request(url)
				.post('/scans?query=invalid')
				.set('authorization', 'Bearer' + token)
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'scannedValue' : 'value',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.post('/scans')
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'scannedValue' : 'scan',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.post('/scans')
				.set('authorization', 'Bearer' + token + 'invlid')
				.send({
					'profileId' : testUser.id,
					'mapIds' : [],
					'scannedValue' : 'scan',
					'location' : {
						'type' : 'scan',
						'coordinates' : [
			                36.54817,
			                -118.82813
			            ]
					}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
	});
	
	
	
	describe('GET /scans/{id}/coord', () => {
		
		it('it should return a list of coordinates of every scan for the given user id' , (done) => {
			chai.request(url)
				.get('/scans/' + testUser.id + '/coord')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					for (var i = 0; i < res.body.length;i++) {
						res.body[i].should.have.property('coord');
						res.body[i].should.have.property('id');
					}
					done();
				});
		});
		
		
		
		it('it should return a Bad Request if a malformed user id is given' , (done) => {
			chai.request(url)
				.get('/scans/' + testUser.id + '4' + '/coord')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return a Bad Request if the given user id does not exist' , (done) => {
			chai.request(url)
				.get('/scans/5abc5cfb73db43393856e366/coord')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return an empty array if the given user does not have any scans' , (done) => {
			chai.request(url)
				.get('/scans/5ad02ada415d0f27341bcfe2/coord')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
					done();
				});
		});
		
		
		
		it('it should return a 400 Bad Request if any query parameters are given' , (done) => {
			chai.request(url)
				.get('/scans/' + testUser.id + '/coord?query=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/scans/' + testUser.id + '/coord')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/scans/' + testUser.id + '/coord')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
	});
	
	
	
	describe('GET /scans/{id}', () => {
		
		it('it should return the scan object of the given scan id' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.should.have.property('_id');
					scans.should.have.property('profileId');
					scans.should.have.property('mapIds');
					scans.should.have.property('scannedValue');
					scans.should.have.property('location');
					var location = scans.location;
					location.should.have.property('coordinates');
					location.should.have.property('type');
					scans.should.have.property('datetime');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when a malfored id is given' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when an invalid id is given' , (done) => {
			chai.request(url)
				.get('/scans/5aa48282f36d28237f19a60b')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when any query parameter is given' , (done) => {
			chai.request(url)
				.get('/scans/5aa48282f36d28237f19a60a?query=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f8')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
	});
	
	
	
	describe('PUT /scans/{id}', () => {
		
		it('it should update a scan object with new values given in the body' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					var oldScan = res.body.scans;
					
					chai.request(url)
					.put('/scans/5ac0625bbafa091adc2b12f8')
					.set('authorization', 'Bearer' + token)
					.send({
						'profileId' : testUser.id,
						'mapIds' : oldScan.mapIds,
						'datetime' : oldScan.datetime,
						'scannedValue' : new Date(),
						'location' : oldScan.location
					})
					.end((err, res) => {
						
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('message');
						res.body.should.have.property('scan');
						
						var newScan = res.body.scan;
						newScan.scannedValue.should.not.eql(oldScan.scannedValue);
						done();
					});
			});
		});
		
		
		
		it('it should return 400 Bad Request if the scan id is not found' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f9')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the scan id is malformed' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if profileid field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if mapIds field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the datetime field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the scannedValue field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the location field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date()
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the coordinates field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan"
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if the type field is missing' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request if any query parameters given' , (done) => {
			chai.request(url)
				.put('/scans/5aa48282f36d28237f19a60a?query=invalid')
				.set('authorization', 'Bearer' + token)
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.put('/scans/5ac0625bbafa091adc2b12f8')
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/scans/5ac0625bbafa091adc2b12f8')
				.set('authorization', 'Bearer' + token + 'invlid')
				.send({
						'profileId' : testUser.id,
						'mapIds' : ["5ac06b2228af972dbca0989b"],
						'datetime' : new Date(),
						'scannedValue' : new Date(),
						'location' : {
							"type" : "scan",
							"coordinates" : [
		                        40.7128,
		                        -85.42
		                    ]
						}
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});

	});
	
	
	
	describe('GET /scans/{id}/maps', () => {
		it('it should get the maps for the given scan when the given scan id exists' , (done) => {
			chai.request(url)
				.get('/scans/5aa48282f36d28237f19a60a/maps')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.not.eql(0);
					
					var maps = res.body;
					for (var i = 0; i < maps.length;i++) {
						maps[i].should.have.property('_id');
						maps[i].should.have.property('type');
						maps[i].should.have.property('name');
						maps[i].should.have.property('createdAt');
						maps[i].should.have.property('shape');
						
					}
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when the given scan id does not exist' , (done) => {
			chai.request(url)
				.get('/scans/5aa48282f36d28237f19a60b/maps')
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
		
		
		
		it('it should return 400 Bad Request when the given scan id is malformed' , (done) => {
			chai.request(url)
				.get('/scans/5aa48282f36d28237f19a60/maps')
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
		
		
		
		it('it should return an mepty array if the given scan does not have any maps' , (done) => {
			chai.request(url)
				.get('/scans/5ac17de57b4983104029934e/maps')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.eql(0);
					done();
				});
		});
	})
	
	
	
	describe('POST /scans/{id}/maps', () => {
		
		
		
		it('it should insert the given map id into the scans mapIds array if the map is not alrady in the array' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ad2e83bbee038280cc75185'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if the given map id is already in the scans mapIds array' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ad2e83bbee038280cc75185'
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if no map id is given in the request body' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if the given scan id does not exist' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e83/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ac07481551fd72e64345127'
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if the given scan id is malformed' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ac07481551fd72e64345127'
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if the given map id does not exist' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ad2e83bbee038280cc75188'
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should 400 Bad Request if the given map id is malformed' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token)
				.send({
						'id' : '5ac07481551fd72e6434512'
				})
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					res.body.should.have.property('statusCode');
					res.body.should.have.property('message');
					done();
				});
		});
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.send({
						'id' : '5ac07481551fd72e64345127'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.post('/scans/5ac181a44ef37e19f43f4e8f/maps')
				.set('authorization', 'Bearer' + token + 'invlid')
				.send({
						'id' : '5ac07481551fd72e64345127'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
	
	});
	
	
	
describe('GET /scans/user/{id}', () => {
		
		
		
		it('it should return all scans created by the given user id' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id)
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					for (var i = 0; i < scans.length; i++) {
						scans[i].should.have.property('_id');
						scans[i].should.have.property('profileId');
						scans[i].should.have.property('mapIds');
						scans[i].should.have.property('scannedValue');
						scans[i].should.have.property('location');
						
						var location = scans[i].location;
						location.should.have.property('coordinates');
					}
					
					done();
				});
		});
		
		
		
		it('it should filter a users scans to only scnas after a certian date' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id + '?from=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.length.should.not.eql(0);
					for (var i = 0; i < scans.length; i++) {
						scans[i].should.have.property('_id');
						scans[i].should.have.property('profileId');
						scans[i].should.have.property('mapIds');
						scans[i].should.have.property('scannedValue');
						scans[i].should.have.property('location');
						
						var location = scans[i].location;
						location.should.have.property('coordinates');
						location.should.have.property('type');
					}
					
					done();
				});
		});
		
		
		
		it('it should filter a users scans to only scnas before a certian date' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id + '?to=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.length.should.not.eql(0);
					for (var i = 0; i < scans.length; i++) {
						scans[i].should.have.property('_id');
						scans[i].should.have.property('profileId');
						scans[i].should.have.property('mapIds');
						scans[i].should.have.property('scannedValue');
						scans[i].should.have.property('location');
						
						var location = scans[i].location;
						location.should.have.property('coordinates');
						location.should.have.property('type');
					}
					
					done();
				});
		});
		
		
		
		it('it should filter a users scans to only scnas in a certain time frame' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id + '?from=2018-03-01&to=2018-04-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.length.should.not.eql(0);
					for (var i = 0; i < scans.length; i++) {
						scans[i].should.have.property('_id');
						scans[i].should.have.property('profileId');
						scans[i].should.have.property('mapIds');
						scans[i].should.have.property('scannedValue');
						scans[i].should.have.property('location');
						
						var location = scans[i].location;
						location.should.have.property('coordinates');
						location.should.have.property('type');
					}
					
					done();
				});
		});
		
		
		
		it('it should return an empty list when an invalid time frame is given' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id + '?from=2018-05-01&to=2018-03-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.length.should.eql(0);
					
					
					done();
				});
		});
		
		
		
		it('it should return an empty list when the given user id does not exist' , (done) => {
			chai.request(url)
				.get('/scans/user/5a9c849a062e6821c4075311')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('scans');
					
					var scans = res.body.scans;
					scans.length.should.eql(0);
					
					
					done();
				});
		});
		
		
		
		it('it should return 400 Bad Request when any wuery parameter is given', (done) => {
				chai.request(url)
					.get('/scans/user/5a9c849a062e6821c40753e1?query=invalid')
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
		
		
		
		it('it should return 401 unauhorized when no bearer tokenn is given' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
		
		
		
		it('it should return 401 unauthorized when an invalid bearer token is given' , (done) => {
			chai.request(url)
				.get('/scans/user/' + testUser.id)
				.set('authorization', 'Bearer' + token + 'invlid')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('error');
					done();
				});
		});
	
	});
	
	
});
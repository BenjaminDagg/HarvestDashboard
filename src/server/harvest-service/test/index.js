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
		createdAt: "2018-04-12T21:56:30.814Z"
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
				.get('/harvest/numcrates?date=2018-03-01')
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
				.get('/harvest/numcrates?date=2018-03-01')
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
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return an empty object if an invalid date format is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=2018-03')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					
					done();
				});
		});
		it('it should return an empty object if an invalid date format is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=2018')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					
					done();
				});
		});
		it('it should return a bad request if an invalid ISO date is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=2018-03T08')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return a list of all crates for a valid date that has crates' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=2018-01-08')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					res.body.crates.length.should.not.eql(0);
					done();
				});
		});
		it('it should return a list of all crates for a specific user for a valid date' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates?date=2018-01-08&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					res.body.crates.length.should.not.eql(0);
					done();
				});
		});
		it('it should return an empty list of crates for a day where no crates were harvested' , (done) => {
			chai.request(url)
			.get('/harvest/numcrates?date=2018-01-09')
			.set('authorization', 'Bearer' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('numCrates');
				res.body.should.have.property('crates');
				res.body.crates.length.should.eql(0);
				done();
			});
	});;
		
	
	});
	describe('/GET /harvest/meandist', () => {
		it('it should return the mean distance between crates for a given user in a given time frame' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('unit');
					res.body.should.have.property('meandist');
					res.body.should.have.property('distance');
					
					var dist = res.body.distance;
					for (var key in dist) {
						var obj = dist[key];
						obj.should.have.property('scan');
						var scan = obj.scan;
						scan.should.have.property('_id');
						scan.should.have.property('profileId');
						scan.should.have.property('datetime');
						scan.should.have.property('mapIds');
						scan.should.have.property('scannedValue');
						scan.should.have.property('location');
						var location = scan.location;
						location.should.have.property('type');
						location.should.have.property('coordinates');
						obj.should.have.property('time_frame');
						obj.should.have.property('distance');
					}
					
					done();
				});
		});
		it('it should return the mean distance between crates for a specific user' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('unit');
					res.body.should.have.property('meandist');
					res.body.should.have.property('distance');
					
					var dist = res.body.distance;
					for (var key in dist) {
						var obj = dist[key];
						obj.should.have.property('scan');
						var scan = obj.scan;
						scan.should.have.property('_id');
						scan.should.have.property('profileId');
						scan.profileId.should.eql('5abc5cfb73db43393856e365');
						scan.should.have.property('datetime');
						scan.should.have.property('mapIds');
						scan.should.have.property('scannedValue');
						scan.should.have.property('location');
						var location = scan.location;
						location.should.have.property('type');
						location.should.have.property('coordinates');
						obj.should.have.property('time_frame');
						obj.should.have.property('distance');
					}
					done();
				});
		});
		it('it should return 400 Bad Request if the given user id does not exist' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01&id=5abc5cfb73db43393856e366')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should empty results if the given time frame is invalid' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-05-01&to=2018-01-01&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('unit');
					res.body.should.have.property('meandist');
					res.body.should.have.property('distance');
					done();
				});
		});
		it('it should be able to calculate distance with a given unit parameter' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01&id=5abc5cfb73db43393856e365&unit=kilometers')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('unit');
					res.body.should.have.property('meandist');
					res.body.should.have.property('distance');
					
					var dist = res.body.distance;
					for (var key in dist) {
						var obj = dist[key];
						obj.should.have.property('scan');
						var scan = obj.scan;
						scan.should.have.property('_id');
						scan.should.have.property('profileId');
						scan.should.have.property('datetime');
						scan.should.have.property('mapIds');
						scan.should.have.property('scannedValue');
						scan.should.have.property('location');
						var location = scan.location;
						location.should.have.property('type');
						location.should.have.property('coordinates');
						obj.should.have.property('time_frame');
						obj.should.have.property('distance');
					}
					done();
				});
		});
		it('it should return 400 Bad Request if the given unit parameter is invalid' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01&id=5abc5cfb73db43393856e365&unit=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return 400 Bad Request if an invalid query parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&to=2018-05-01&id=5abc5cfb73db43393856e365&unit=miles&query=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return 400 Bad Request if no from query is parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?to=2018-05-01&id=5abc5cfb73db43393856e365&unit=invalid')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return 400 Bad Request if no to query is parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/meandist?from=2018-01-01&id=5abc5cfb73db43393856e365')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
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
		it('it should return the mean time for all user crates from a given time frame' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=2018-01-01&to=2018-01-10')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.body.should.have.property('meantime');
					res.should.have.status(200);
					res.body.should.have.property('meantime');
					res.body.should.have.property('crates')
					for (var key in res.body.crates) {
						var obj = res.body.crates[key];
						obj.should.have.property('time_frame');
						obj.should.have.property('time');
						obj.should.have.property('unit');
						obj.should.have.property('crate');
						var crate = obj.crate;
						crate.should.have.property('_id');
						crate.should.have.property('profileId');
						crate.should.have.property('mapIds');
						crate.should.have.property('scannedValue');
						crate.should.have.property('location');
						var location = obj.crate.location;
						location.should.have.property('type');
						location.should.have.property('coordinates');
						crate.should.have.property('datetime');
					}
					done();
				});
		});
		it('it should return an empty object if no crate were found in the given time frame' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=2018-01-20&to=2018-01-21')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.body.should.have.property('meantime');
					res.body.meantime.should.eql(0);
					res.body.should.have.property('crates');
					res.should.have.status(200);
					done();
				});
		});
		it('it should return an empty object if the given time frame is invalid' , (done) => {
			chai.request(url)
				.get('/harvest/meantime?from=2018-04-15&to=2018-01-16')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.body.should.have.property('meantime');
					res.body.meantime.should.eql(0);
					res.body.should.have.property('crates');
					res.should.have.status(200);
					done();
				});
		});
			
	
	});
	describe('/GET /harvest/numcrates/between', () => {
		it('it should return Unauthorized if no bearer token is given in the authorization header' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-01-01&to=2018-01-01')
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
				.get('/harvest/numcrates/between?from=2018-01-01&to=2018-01-01')
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
		it('it should return a bad request if there are no parameters' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return a bad request if no to parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-01-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return a bad request if no from parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?to=2018-01-01')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return a bad request if malformed id parameter is given' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-01-01&to=2018-01-10&id=5abc5cfb73db43393856e36')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					done();
				});
		});
		it('it should return a list of crates for all users for crates from 03/31/2018 to 04/01/2018' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-01-01&to=2018-01-10')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.should.have.property('crates');
					res.body.should.have.property('cratesPerDay');
					var crates = res.body.crates;
					crates.length.should.not.eql(0);
					for (var i = 0; i < crates.length;i++) {
						crates[i].should.have.property('_id');
						crates[i].should.have.property('profileId');
						crates[i].should.have.property('mapIds');
						crates[i].should.have.property('datetime');
						crates[i].should.have.property('scannedValue');
						crates[i].should.have.property('location');
						var location = crates[i].location;
						location.should.have.property('type');
						location.should.have.property('coordinates');
						
					}
					done();
				});
		});
		it('it should return an empty result if the given date time frame is invalid' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-04-01&to=2018-01-10')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('numCrates');
					res.body.numCrates.should.eql(0);
					res.body.should.have.property('crates');
					res.body.crates.length.should.eql(0);
					res.body.should.have.property('cratesPerDay');
					
						
					
					done();
				});
		});
		
		it('it should return 400 Bad Reques if he given user id does not xistt' , (done) => {
			chai.request(url)
				.get('/harvest/numcrates/between?from=2018-04-01&to=2018-01-10&id=5abc5cfb73db43393856e366')
				.set('authorization', 'Bearer' + token)
				.end((err, res) => {
					res.should.have.status(400);
					res.body.should.have.property('statusCode');
					res.body.should.have.property('error');
					res.body.should.have.property('message');
					
						
					
					done();
				});
		});
		it('it should return a list of crates for a specific user' , (done) =>
		{
			chai.request(url)
			.get('/harvest/numcrates/between?from=2018-01-01&to=2018-01-10&id=' + testUser.id)
			.set('authorization', 'Bearer' + token)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('numCrates');
				res.body.should.have.property('crates');
				res.body.should.have.property('cratesPerDay');
				var crates = res.body.crates;
				crates.length.should.not.eql(0);
				for (var i = 0; i < crates.length;i++) {
					crates[i].should.have.property('_id');
					crates[i].should.have.property('profileId');
					crates[i].profileId.should.eql(testUser.id);
					crates[i].should.have.property('mapIds');
					crates[i].should.have.property('datetime');
					crates[i].should.have.property('scannedValue');
					crates[i].should.have.property('location');
					var location = crates[i].location;
					location.should.have.property('type');
					location.should.have.property('coordinates');
					
				}
				done();
			});
		});
	

	});

});
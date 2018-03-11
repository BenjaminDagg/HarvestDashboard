/**
 * 
 */

const mongojs = require('mongojs');


exports.register = function(server, options, next) {
	
	const db = server.app.db;
	
	// ******************* Maps **********************
	
	
	/*
	 * Gets list of all maps in database
	 * 
	 * Request:
	 * 		GET
	 * 		body: none
	 * 		url param: none
	 * 
	 * Response:
	 * 		200 - Array of map objects
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/maps',
		handler: function (request, reply) {
			db.Maps.find((err, docs) => {
				if (err) {
					response = {
						error: 'Error retrieving user(s) from database'
					};
					reply(response).code(400);
				}
				
				reply((docs)).code(200);
			});
		}
	});
	
	
	/*
	 * Insert new map object into database
	 * 
	 * Request:
	 * 		POST
	 * 		Body: map object
	 * 			type: String
	 * 			name: String
	 * 			shape: {
	 * 				type: String (point, LineString, Polygon)
	 * 				coordinates: [Float]
	 * 			}
	 * Response:
	 * 		400 - Invalid map object
	 * 		200 - Map was added returns map object back
	 * 		in body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'POST',
		path: '/maps',
		handler: function (request, reply) {
			
			//get map object from body
			const map = request.payload;
			console.log(map);
			//check if map object is valid
			if (!('type' in map) ||
				!('name' in map) ||
				!('shape' in map)) {
				
				return reply('Bad request. Missing perameters').code(400);
			}
			
			db.Maps.save(map, (err, result) => {
				if (err) {
					return reply('Server error. Error adding map').code(500);
				}
				reply('Map added').code(200);
			})
		}
	});
	
	
	/*
	 * Get a specific map by id
	 * 
	 * Request:
	 * 		GET
	 * 		Body: non
	 * 		url param: id (id of map)
	 * 
	 * Response:
	 * 		400 - Invalid request ( map id doesnt exist )
	 * 		200 - Map obj included in body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/maps/{id}',
		handler: function (request, reply) {
			
			//get id from url
			const id = request.params.id;
			
			//check valid id
			if (id.length != 24) {
				return reply('Invalid map id').code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.Maps.findOne({_id: objID}, (err, doc) => {
				if (err) {
					return reply('Server error').code(500);
				}
				else if (!doc) {
					return reply('Bad request. Map not found').code(400);
				}
				else {
					const response = {
							map: doc
					};
					return reply(response).code(200);
				}
			})
		}
	});
	
	
	/*
	 * Gets map data of every map for the given user id
	 * 
	 * Request:
	 * 		GET
	 * 		user id in url
	 * 		no body
	 * 
	 * Response:
	 * 		400 - Bad request (user not found)
	 * 		200 - Returns array of map object for the user
	 * 
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/maps/user/{id}',
		handler: function (request, reply) {
			
			//get id from body
			const id = request.params.id;
			
			//check if id format is valid
			//must be 24 digit hex number
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						maps: null
				};
				return reply(result).code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			//check database for scans of this id
			db.collection('scans').find({profileId: id}, (err, doc) => {
				if (err) {
					
					return reply(err).code(400);
				}
				else if (!doc) {
					response = {
						error: 'Error user not found'
					};
					return reply(response).code(400);
				}
				else {
					//array to hold map ids for every scan
					var mapIds = new Array();
					
					//iterate over every fetched scan
					//and insert its mapIds into the array
					for (var i = 0; i < doc.length;i++) {
						//current scan object
						var obj = doc[i];
						//scan object's maps array
						var maps = obj.mapIds;
						//iterate over map array and insert each id in the array
						for (var j = 0; j < maps.length;j++) {
							//create mapId obj then insert
							mapIds.push(mongojs.ObjectId(maps[j]));
						}
					}
					
					//now get map object for every fetched map
					db.Maps.find( {
						_id: {
							$in: mapIds
						}
					}, (err,docs) => {
						if (err) {
							return reply('error').code(500);
						}
						reply(docs).code(200);
					});
					
				}
				
			});
		}
	});
	
	
	//************** Scans *******************
	
	/*
	 * Gets all scans from database
	 * 
	 * Request:
	 * 		GET
	 * 		no body
	 * Response:
	 * 		400 - bad request
	 * 		200 - OK sends array of scan objects in body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/scans',
		handler: function (request, reply) {
			db.collection('scans').find((err, docs) => {
				if (err) {
					response = {
						error: 'Error retrieving user(s) from database'
					};
					return reply(response).code(400);
				}
				
				const response = {
						scans: docs
				};
				reply((response)).code(200);
			});
		}
	});
	
	
	/*
	 * Adds new scan to database with scan object given in request
	 * 
	 * Request:
	 * 		POST
	 * 		scan object in body
	 * 			scan {
	 * 				profileId : String
	 * 				mapsIds: [String]
	 * 				scannedValue: String
	 * 				location : {
	 * 					type: string
	 * 					coordinates: [Float]
	 *				}
	 *				data: {}
	 *Response:
	 *		500 - something went wrong on server end whe trying to add
	 *		400 - Bad request. You gave an invalid scan obj (missing fields )
	 *		200 - Scan added to database successfully
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'POST',
		path: '/scans',
		handler: function (request, reply) {
			
			//get scan from body
			const scan = request.payload;
			
			//check if passed in scan data is valid
			if (!('profileId' in scan) ||
				!('datetime' in scan) ||
				!('location' in scan) ||
				!('scannedValue' in scan)) {
				
				const response = {
						error: 'Fields missing.'
				};
				return reply(response).code(400);
			}
			
			//add scan to database
			db.collection('scans').save(scan, (err, result) => {
				if (err) {
					const response = {
							error: err
					};
					reply(response).code(500);
				}
				else {
					const response = {
							messege: 'scan added',
							scan: scan
					}
					reply(response).code(200);
				}
					
			});
		}
	});
	
	
	/*
	 * Gets specific scan from database by its id
	 * 
	 * Request:
	 * 		GET
	 * 		scan id in url
	 * Response:
	 * 		400 - Bad Request (scan doesnt exists)
	 * 		200 - OK scan sent in response body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/scans/{id}',
		handler: function (request, reply) {
			
			//parse id from url
			const id = request.params.id;
			
			//check if id format is valid
			//must be 24 digit hex number
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						users: null
				};
				return reply(result).code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.collection('scans').findOne({_id: objID}, (err, doc) => {
				if (err) {
					
					return reply(err).code(400);
				}
				else if (!doc) {
					response = {
						error: 'Error user not found'
					};
					return reply(response).code(400);
				}
				else {
					const response = {
						scans: doc
					};
					reply((response)).code(200);
				}
				
			});
		}
	});
	
	
	/*
	 * Updates the given scans info from data in body
	 * 
	 * Request 
	 * 		PUT
	 * 		new scan object in body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'PUT',
		path: '/scans/{id}',
		handler: function (request, reply) {
			
			//parse id from url
			const id = request.params.id;
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			//check if id format is valid
			//must be 24 digit hex number
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						users: null
				};
				return reply(result).code(400);
			}
			
			db.collection('scans').update({_id:objID}, {
				
				mapIds: request.payload.mapIds,
				scannedValue: request.payload.scannedValue,
				location: request.payload.location,
				data: request.payload.data
			}, function () {
				reply('updated').code(200);
			});
			
		}
	});
	
	
	/*
	 * Gets mapa for a given scan id
	 * 
	 * Request:
	 * 		GET
	 * 		body : none
	 * 		url parameter: id ( id of scan )
	 * 
	 * Response:
	 * 		400 - Bad request id not found
	 * 		200 - array of maps for the scan
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/scans/{id}/maps',
		handler: function (request, reply) {
			
			//get id from url
			const id = request.params.id;
			
			//check valid id
			if (id.length != 24) {
				return reply('Invalid map id').code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.collection('scans').findOne({_id: objID}, (err, doc) => {
				if (err) {
					return reply('Server error').code(500);
				}
				else if (!doc) {
					return reply('Bad request. Map not found').code(400);
				}
				else {
					const mapIds = doc.mapIds;
					for (var i = 0; i < mapIds.length;i++) {
						mapIds[i] = mongojs.ObjectId(mapIds[i]);
					}
					
					//now get map object for every fetched map
					db.Maps.find( {
						_id: {
							$in: mapIds
						}
					}, (err,docs) => {
						if (err) {
							return reply('error').code(500);
						}
						reply(docs).code(200);
					});
				}
			})
		}
	});
	
	
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-maps'
};
/**
 * Routes for the maps api
 */

const mongojs = require('mongojs');


//This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}

//This should work both there and elsewhere.
function isEmptyObject(obj) {
	for (var key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			return false;
		}
	}
	return true;
}


//formats date from MMDDYYYY or YYYY-MM-DD to MM/DD/YYYY
function formatDate(date) {
	if (date.length != 8 && date.length != 10) {
		return date;
	}
	
	//converting from YYYY-MM-DD to MM/DD/YYYY
	if (date.indexOf('-') > -1) {
		
		newDate = date.slice(5,7) + '/' + date.slice(8, date.length) + '/' + date.slice(0,4);
		return newDate;
	}
	//converting from MMDDYYYY to MM/DD/YYYY
	else {
		
		return date.slice(0, 2) + "/" + date.slice(2, 4) + "/" + date.slice(4, 8);
	}
	
}

//checks if date check is within the dates from and to
function dateCheck(from,to,check) {

    var fromDate,toDate,currDate;
    fromDate = Date.parse(from);
    toDate = Date.parse(to);
    currDate = Date.parse(check);
    
    if (to == '') {
    	return currDate >= fromDate;
    }
    else if (from == '') {
    	return currDate <= toDate
    }
    else {
    	if((currDate <= toDate && currDate >= fromDate)) {
            return true;
        }else {
        return false;
        
        }
    }
    
}

exports.register = function(server, options, next) {
	
	const db = server.app.db;
	
	// ******************* Maps **********************
	
	
	/*
	 * Gets list of all maps in database
	 * 
	 * Request:
	 * 		GET
	 * 		body: none
	 * 		url param: 
	 * 			id: get only maps from the given user id
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
			
			const params = request.query;
			
			db.Maps.find((err, docs) => {
				if (err) {
					response = {
						error: 'Error retrieving map(s) from database'
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
			
			if (!map) {
				return reply({error: 'Bad request. Missing body'}).code(400);
			}
			
			//check if map object is valid
			if (!('type' in map) ||
				!('name' in map) ||
				!('shape' in map) ||
				!('data' in map)) {
				
				return reply({error: 'Bad request. Missing fields'}).code(400);
			}
			
			//save date the map was added
			//format: YYYY-MM-DD
			var date = new Date();
			var day = date.getDate();
			day = (day < 10 ? "0" : "") + day;
			var month = date.getMonth() + 1;
			month = (month < 10 ? "0" : "") + month;
			var year = date.getFullYear();
			var hour = date.getHours();
		    hour = (hour < 10 ? "0" : "") + hour;
		    var min  = date.getMinutes();
		    min = (min < 10 ? "0" : "") + min;
		    var sec  = date.getSeconds();
		    sec = (sec < 10 ? "0" : "") + sec;
		    var dateStr = year + "-" + month + "-" + day ;
		    
		    map.createdAt = dateStr;
			
			db.Maps.save(map, (err, result) => {
				if (err) {
					return reply('Server error. Error adding map').code(500);
				}
				reply({messege: 'Map added successfully'}).code(200);
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
				return reply({error: 'Bad request. Invalid map id'}).code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.Maps.findOne({_id: objID}, (err, doc) => {
				if (err) {
					return reply({error: 'Bad request. Map not found'}).code(400);
				}
				else if (!doc) {
					return reply({error: 'Bad request. Map not found'}).code(400);
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
	 * 		query params:
	 * 			from: get only maps after this date
	 * 			to: get only maps before this date
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
			
			const params = request.query;
			
			//check if id format is valid
			//must be 24 digit hex number
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						maps: []
				};
				return reply(result).code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			//check database for scans of this id
			db.collection('scans').find({profileId: id}, (err, doc) => {
				if (err) {
					
					return reply({error: 'Error. No maps found for this user'}).code(400);
				}
				else if (!doc) {
					response = {
						error: 'Error. No maps found for this user'
					};
					return reply(response).code(400);
				}
				else {
					
					
					if (doc.length == 0) {
						response = {
							error: 'Error. No maps found for this user'
						};
						return reply(response).code(400);
					}
					
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
						
						//check if date limiters in url
						if (!isEmptyObject(params)) {
							
							var from = 'from' in params ? formatDate(params.from) : "";
							var to = 'to' in params ? formatDate(params.to) : "";
							
							//list of maps that fall in the date range
							var validMaps = new Array();
							
							for (var i = 0; i < docs.length; i++) {
								
								if ('createdAt' in docs[i]) {
									//parse date
									var date = docs[i].createdAt;
									var newDate = formatDate(date);
									
									//if map date is in range then add it to list
									if (dateCheck(from, to, newDate) == true) {
										validMaps.push(docs[i]);
									}
								}
							}
							
							return reply(validMaps).code(200);
							
							
						}
					
						return reply(docs).code(200);
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
	 * 
	 * Optional url parameters: can combine all of the queries
	 * 		id (string) - limit results to only this user
	 *		from (string) - date in the format MMDDYYYY that is the starting day of the timefram
	 *		to (string) - date in the format MMDDYYYY that is the end day of the timefram
	 *	
	 *		if leave out to, will return all scans after from date
	 *		if leave out from, will return all scans newer than or equal to to date
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
			
			//get optional query parameters form url if they exist
			const params = request.query;
			
			//check if any query parameters
			if (!isEmptyObject(params)) {
				
				var from, to, id;
				
				from = 'from' in params ? formatDate(params.from) : "";
				to = 'to' in params ? formatDate(params.to) : "";
				
				//check if id is a parameter first
				if ('id' in params) {
					const id = params.id;
					
					//get array of this users scans then narrow it down later
					db.collection('scans').find({profileId: id},function (err, docs) {
						if (err) {
							return reply(err).code(500);
						}
						else {
							
							//if a date frame is given then narrow down result
							//to only dates in thsi time frame
							if (from || to) {
								console.log('in date');
								var scans = docs;
								var result = new Array();
			
								for (var i = 0; i < scans.length;i++) {
									const date = formatDate(scans[i].datetime);
								    
									if (dateCheck(from,to,date) == true) {
										result.push(scans[i]);
									}
								}
								return reply(result).code(200);
							
							}
							//no time frame given so return all scane
							//by this user
							else {
								
								return reply(docs).code(200);
							}
						}
		
					});
				}
				//no specific user given so return scans in the given
				//time frame
				else {
					db.collection('scans').find(function (err, docs) {
						if (err) {
							return reply(err).code(500);
						}
						else {
							
							var scans = docs;
							var result = new Array();
							
							for (var i = 0; i < scans.length;i++) {
								const date = formatDate(scans[i].datetime);
								
								if (dateCheck(from,to,date) == true) {
									result.push(scans[i]);
								}
							}
							return reply(result);
						}
						
					});
				}
				
			} 
			//no query parameters given. Return all scans from database
			else {
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
					return reply((response)).code(200);
				});
			}
		}
	});
	
	
	
	//************** Scans *******************
	
	
	
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
	 *				
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
				!('location' in scan) ||
				!('scannedValue' in scan) ||
				!('mapIds' in scan)) {
				
				const response = {
						error: 'Fields missing.'
				};
				return reply(response).code(400);
			}
			
			//check if coordinates given in location
			var location = scan.location;
			if (!('coordinates' in location)) {
				const response = {
						error: 'Fields missing.'
				};
				return reply(response).code(400);
			}
			
			//create datetime field
			var date = new Date();
			var day = date.getDate();
			day = (day < 10 ? "0" : "") + day;
			var month = date.getMonth() + 1;
			month = (month < 10 ? "0" : "") + month;
			var year = date.getFullYear();
			var hour = date.getHours();
		    hour = (hour < 10 ? "0" : "") + hour;
		    var min  = date.getMinutes();
		    min = (min < 10 ? "0" : "") + min;
		    var sec  = date.getSeconds();
		    sec = (sec < 10 ? "0" : "") + sec;
		    var dateStr = year + "-" + month + "-" + day ;
		    
		    scan.datetime = dateStr;
			
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
	 * Gets coordinates of every scan for a given user id
	 * 
	 * Request:
	 * 		GET
	 * 		no body
	 * 
	 * Response:
	 * 		400 - Bad Request. Given user not found in database
	 * 		200 - Returns array of objects structured
	 * 			{
	 * 				scanId: (string),
	 * 				coord: [Float]
	 * 			{
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/scans/{userId}/coord',
		handler: function (request, reply) {
			
			//get userid from url
			const uid = request.params.userId;
			
			//check if valid id was given
			if (uid.length != 24) {
				return reply({error:'Bad Request. Invalid username'}).code(400);
			}
			
			//search database for scans by this user
			db.collection('scans').find({profileId: uid}, function(err, docs) {
				
				if (err) {
					return reply({error:'Error searching database'}).code(500);
				}
				
				if (docs.length == 0) {
					return reply({error: 'No scans found for this user'}).code(400);
				}
				
				//extract coordinates and id from each doc
				var coords = new Array();
				for (var i = 0; i < docs.length;i++) {
					const res = {
							coord: docs[i].location.coordinates,
							id: docs[i]._id
					};
					coords.push(res);
				}
				
		
				reply(coords);
				
			})
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
						error: 'Invalid ID format. User ID must be 24 characters'
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
						error: 'Error scan not found'
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
			
			//check if id format is valid
			//must be 24 digit hex number
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters'
				};
				return reply(result).code(400);
			}
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			
			
			const scan = request.payload;
			if (!('profileId' in scan) ||
				!('mapIds' in scan) ||
				!('scannedValue' in scan) ||
				!('location' in scan) ||
				!('datetime' in scan)) {
				
				return reply({error: 'Bad Request. Missing fields'}).code(400);
			}
			
			//check if location has coordinates field
			if (!('coordinates' in scan.location)) {
				return reply({error: 'Bad Request. Missing fields'}).code(400);
			}
			
			
			db.collection('scans').findAndModify({
				query: {_id: objID},
				update: {
					profileId: scan.profileId,
					mapIds: request.payload.mapIds,
					scannedValue: request.payload.scannedValue,
					location: request.payload.location,
					datetime: scan.datetime
				}
			}, (err, doc, lastErrorObject) => {
				if (err) {
					return reply({error: 'Error updating scan'}).code(400);
				}
				
				if (!doc) {
					return reply({error: 'Error updating scan'}).code(400);
				}
				
				return reply({messege: 'updated', scan: request.payload}).code(200);
			})
			
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
	
	
	
	/*
	 * Inserts new map into a scans mapIds array
	 * 
	 * Request:
	 * 		POST
	 * 		Body:
	 * 		id: id of map to insert
	 * 
	 * Response:
	 * 		400 - given scan id invalid
	 * 		200 - map was inserted successfully
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'POST',
		path: '/scans/{id}/maps',
		handler: function (request, reply) {
			
			//get id from url
			const id = request.params.id;
			
			
			//check if map id given
			if (!request.payload) {
				return reply({error: 'Invalid reqest. Missing id in body'}).code(400);
			}
			
			const mapId = request.payload.id;
			
			//check valid id
			if (id.length != 24) {
				return reply({error: 'Bad Request. Invalid scan id'}).code(400);
			}
			
			//check if valid map id
			if (mapId.length != 24) {
				return reply({error: 'Bad Request. Invalid scan id'}).code(400);
			}
			
			//searach database for map
			const mapObjId = mongojs.ObjectId(mapId);
			db.Maps.findOne({_id : mapObjId}, (mapErr, map) => {
				if (mapErr) {
					return reply({error: 'Error searching database for map'}).code(400);
				}
				
				if (!map) {
					return reply({error: 'Bad Request. Map id not found in database'}).code(400);
				}
				
				//map id found now search for scan
				
				//create mongo id object
				const objID = mongojs.ObjectId(id);
				
				db.collection('scans').findOne({_id: objID}, function (err, doc) {
					if (err) {
						return reply(err).code(400);
					}
					if (!doc) {
						return reply({error: 'Scan id not found'}).code(400);
					}
					else {
						var newScan = doc;
						
						//check if map id is already in the scans mapIds array
						for (var i = 0; i < doc.mapIds.length;i++) {
							if (doc.mapIds[i] == mapId) {
								return reply({error: 'Error adding map. Map id already exists in this scan'}).code(400);
							}
						}
						
						//map id not in scan so insert it
						newScan.mapIds.push(mapId);
						
						db.collection('scans').update({_id:objID}, {
							
							profileId : doc.profileId,
							datetime : doc.datetime,
							mapIds: newScan.mapIds,
							scannedValue : doc.scannedValue,
							location: doc.location,
							
						}, function () {
							reply({messege: 'Map successfully updated'}).code(200);
						});
						
					}
				})
				
			})
		}
	});
	
	
	
	/*
	 * Gets all scans for a given user id
	 * 
	 * Request:
	 * 		GET
	 * 		no body
	 * 		user id in url
	 * 		query parameters:
	 * 			from: get all scans after this date
	 * 			to: get all scans before this date
	 * 
	 * Response:
	 * 		400 - no scans found for this user id
	 * 		200 - Returns array of scan object for the given user
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'GET',
		path: '/scans/user/{id}',
		handler: function (request, reply) {
			
			//get id from url
			const uid = request.params.id;
			
			//get query parameters
			const params = request.query;
			
			//check if id is valid
			if (uid.length != 24) {
				return reply('Invalid user id').code(400);
			}
			
			db.collection('scans').find({profileId: uid}, function(err, docs) {
				if (err) {
					return reply('Error searching database').code(500);
				}
				
				if (!isEmptyObject(params)) {
					var validScans = new Array();
					
					var from = 'from' in params ? formatDate(params.from) : "";
					var to = 'to' in params ? formatDate(params.to) : "";
					
					for (var i = 0; i < docs.length;i++) {
						var oldDate = docs[i].datetime;
						var newDate = formatDate(oldDate);
						
						if (dateCheck(from,to,newDate) == true) {
							validScans.push(docs[i]);
						}
					}
					
					return reply({scans: validScans}).code(200);
				}
				
				const resp = {
						scans: docs
				};
				return reply(resp).code(200);
				
			})
			
			
		}
	});
	
	
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-maps'
};
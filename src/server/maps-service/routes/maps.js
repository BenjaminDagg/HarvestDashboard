/**
 * Routes for the maps api
 */

const mongojs = require('mongojs');
var Joi = require('joi');
var moment = require('moment');
//utc offset for Pacific Standard Time (8 hours behind)
const utcOffsetPST = "-8:00"

//schemas
var mapSchema = require('../schemas/map/map-schema');
var errorSchema = require('../schemas/error/error-schema');
var scanSchema = require('../schemas/scan/scan-schema');


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

//formats andy date string into an ISO date
function formatDateISO(date) {
	
	//iso regex
	var iso = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/;
	
	
	
	if (!date) {
		var currDay = new Date().getDay();
		var currMonth = new Date().getMonth() + 1;
		
		var month = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
		var day = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
		var year = '2018';
		if (day < 10) {
			day = '0' + day;
		}
		
		var d = year + '-' + '0' + month + '-' + day;
		
		return formatDateISO(d);
	}
	
	
	//date is already in ISO format
	else if (iso.test(date)) {
		console.log('is iso');
		return date;
	}
	//convert YYYY-MM-dd -> ISO
	else if(date.indexOf('-') > -1 && date.length == 10) {
		
		var isoDate = moment().utc(utcOffsetPST).toISOString();
		var newDate = date + isoDate.slice(10,isoDate.length);
		
		return newDate;
	}
	//convert MM/dd/YYYY -> ISO
	else if (date.indexOf('/') > -1 && date.length == 10) {
		var d = date.slice(4,10) + '-' + date.slice(0,2) + '-' + date.slice(2,4);
		return formatDateISO(d);
	}
	//convert MMddYYYY -> ISO
	else if (date.indexOf('-') < 0 && date.indexOf('/') < 0 && date.length == 8) {
		var d = date.slice(0, 2) + "/" + date.slice(2, 4) + "/" + date.slice(4, 8);
		return formatDate(d);
	}
	else if (date.indexOf(':') > -1 && date.length == 19) {
		var newDate = date.slice(0,10).replace(/:/g, '-');
		var time = 'T' + date.slice(11,19) + '.' + (Math.floor(Math.random() * (999 - 100 + 1)) + 100) + 'z';
		return formatDate(newDate + time);
	}
	
}

exports.register = function(server, options, next) {
	
	const db = server.app.db;
	
	/*
	server.route({
		method: 'GET',
		path: '/updatedates',
		handler: function(request, reply) {
			var scans = {};
			db.Maps.find((err, docs) => {
				for (var i = 0; i < docs.length;i++) {
					var objID = mongojs.ObjectId(docs[i]._id);
					var date = formatDateISO(docs[i].createdAt);
					
					
					db.Maps.findAndModify({
						query: {_id: objID},
						update: {$set: {createdAt: date}},
				
					}, function(err, doc, lastErrorObject) {
						
					})
					
					
				}
				return reply('hello');
			})
		}
	});
	*/
	
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
			},
			validate: {
				
				query: {
					id: Joi.string().length(24),
					from: Joi.date(),
					to: Joi.date()
				}
			}
		},
		method: 'GET',
		path: '/maps',
		handler: function (request, reply) {
			
			const params = request.query;
			
			//query parameters were given
			if (!isEmptyObject(params)) {
				
				//build query object
				var query = {
						_id: null,
						createdAt: null
				};
				
				//check if id was given
				if ('id' in params) {
					query._id = mongojs.ObjectId(params.id);
				}
				else {
					//remove _id key from query if no id gien
					delete query._id;
				}
				
				//delete to and from keys from query if they are not given
				if (!('from' in params) && !('to' in params)) {
					delete query.createdAt;
				}
				else {
					
					//from and to both given
					if (('from' in params) && ('to' in params)) {
						query.createdAt = {
								//create iso string from passed in date
								$gte: params.from.toISOString(),
								$lte: params.to.toISOString()
						}
					}
					//only from given
					else if ('from' in params) {
						query.createdAt = {
								$gte: params.from.toISOString()
						};
					}
					//only to given
					else {
						query.createdAt = {
								$lte: params.to.toISOString()
						};
					}
				}
				
				//search database pass in query object
				db.Maps.find(query ,(err, docs) => {
					
					if (err) {
						console.log('in error');
						var response = {
							statusCode: 400,
							error: 'Error Searching for maps',
							message: 'No maps found'
						};
						return reply(response).code(400);
					}
					
					//no results return empty array
					if (docs.length == 0 || !docs) {
						return reply(new Array()).code(200);
					}
					
					//copy docs into array before returning
					var maps = new Array();
					for (var i = 0; i < docs.length; i++) {
						
						
						var newMap = {
								_id: docs[i]._id.toString(),
								type: docs[i].type,
								name: docs[i].name,
								createdAt: docs[i].createdAt,
								shape: docs[i].shape,
								data: docs[i].data
						};
						maps.push(newMap);
					}
					return reply(maps).code(200);
				})
			}
			//no query parameters given
			else {
				
				//return all maps 
				db.Maps.find({}, (err, docs) => {
					
					if (err) {
						var response = {
								statusCode: 400,
								error: 'Error Searching for maps',
								message: 'No maps found'
							};
							return reply(response).code(400);
					}
					
					if (docs.length == 0 || !docs) {
						return reply(new Array()).code(200);
					}
					
					var maps = new Array();
					for (var i = 0; i < docs.length; i++) {
						var newMap = {
								_id: docs[i]._id.toString(),
								type: docs[i].type,
								name: docs[i].name,
								createdAt: docs[i].createdAt,
								shape: docs[i].shape,
								data: docs[i].data
						};
						maps.push(newMap);
					}
					return reply(maps).code(200);
				})
			}
			
			
			
			
		}
	}); 
	
	
	
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			validate: {
				payload: {
					type: Joi.string().required(),
					name: Joi.string().required(),
					shape: Joi.object().keys({
						type: Joi.string(),
						coordinates: Joi.array()
					}).required(),
					data: Joi.object()
				},
				params: {
					//none
				},
				query: {
					//none
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						messege: Joi.string().required()
					}).required(),
					400: errorSchema
				}
			}
		},
		method: 'POST',
		path: '/maps',
		handler: function (request, reply) {
			
			//get map object from body
			const map = request.payload;
		
			//creates date in ISO format and assigns it to user createdAt
			var date = moment().utc(utcOffsetPST).toISOString(); 
		    map.createdAt = date;
			
		    //insert into database
			db.Maps.save(map, (err, result) => {
				if (err) {
					var response = {
							statusCode: '400',
							error: 'Error Inserting map into database',
							message: 'Server error'
					};
					return reply(response).code(400);
				}
				return reply({messege: 'Map added successfully'}).code(200);
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
			},
			validate: {
				params: {
					id: Joi.string().length(24).required()
				},
				query: {
					//none
				}
			},
			response: {
				status: {
					200: mapSchema,
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/maps/{id}',
		handler: function (request, reply) {
			
			//get id from url
			const id = request.params.id;
			
			
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			var response;
			
			db.Maps.findOne({_id: objID}, (err, doc) => {
				if (err) {
					response = {
							statusCode: 400,
							error: 'Error getting map',
							message: 'Given map id not found'
					};
					return reply(response).code(400);
				}
				else if (!doc) {
					response = {
							statusCode: 400,
							error: 'Error getting map',
							message: 'Given map id not found'
					};
					return reply(response).code(400);
				}
				else {
					var newMap = {
							_id: doc._id.toString(),
							type: doc.type,
							name: doc.name,
							createdAt: doc.createdAt,
							shape: doc.shape,
							
					};
					if (doc.data) {
						newMap.data = doc.data;
					}
					return reply(newMap).code(200);
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
			},
			validate: {
				params: {
					id: Joi.string().length(24).required()
				},
				query: {
					from: Joi.date(),
					to: Joi.date()
				}
			},
			response: {
				status: {
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/maps/user/{id}',
		handler: function (request, reply) {
			
			//get id from body
			const id = request.params.id;
			
			const params = request.query;
			
			
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			var response;
			
			//search database to check if user id exists
			db.collection('user').findOne({_id: objID}, (err,doc) => {
				
				if (err) {
					response = {
							statusCode: 400,
							error: 'Error getting users maps',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				else if (!doc) {
					response = {
							statusCode: 400,
							error: 'Error getting users maps',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				else {
					//check database for scans of this id
					db.collection('scans').find({profileId: id}, (err, doc) => {
						if (err) {
							//error in database lookup
							response = {
									statusCode: 400,
									error: 'Error searching for user maps',
									message: 'No maps found for this user'
							};
							return reply(response).code(400);
						}
				
						//scans found
						else {
							
							if (!doc || doc.length == 0) {
								return reply(new Array()).code(200);
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
									mapIds.push(mongojs.ObjectId(maps[j].toString()));
								}
							}
					
					
							var query = {
									_id: {
										$in: mapIds
									},
									createdAt: null
							};
					
					
							//delete to and from keys from query if they are not given
							if (!('from' in params) && !('to' in params)) {
								delete query.createdAt;
							}
							else {
						
								//from and to both given
								if (('from' in params) && ('to' in params)) {
									query.createdAt = {
											//create iso string from passed in date
											$gte: params.from.toISOString(),
											$lte: params.to.toISOString()
									}
								}
								//only from given
								else if ('from' in params) {
									query.createdAt = {
											$gte: params.from.toISOString()
									};
								}
								//only to given
								else {
									query.createdAt = {
											$lte: params.to.toISOString()
									};
								}
							}
					
							//search database for all maps in mapIds array
							db.Maps.find(query, (err,docs) => {
								//no documents found
								if (err) {
									response = {
											statusCode: 400,
											error: 'Error searching for user maps',
											message: 'No maps found for this user'
									};
									return reply(response).code(400);
								}
						
								//no matches in query. Return empty list
								if (!docs || docs.length == 0) {
									return reply(new Array()).code(200);
								}
						
								//found the maps in database
								//copy documents into array then return it
								var results = new Array();
								for (var i = 0; i < docs.length;i++) {
									//copy document
									var newMap = {
											_id: docs[i]._id.toString(),
											type: docs[i].type,
											name: docs[i].name,
											createdAt: docs[i].createdAt,
											shape: docs[i].shape		
									};
									if (docs[i].data) {
										newMap.data = docs[i].data;
									}
									results.push(newMap);
							
								}
								return reply(results).code(200);
							})
					
						}
				
					});
				}
			})
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
			},
			validate: {
				query: {
					from: Joi.date(),
					to: Joi.date(),
					id: Joi.string().length(24)
				},
				params: {
					//none
				}
			},
			response: {
				status: {
					200: Joi.array().items(scanSchema),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/scans',
		handler: function (request, reply) {
			
			//get optional query parameters form url if they exist
			const params = request.query;
			var response;
			
			
			//make search queries to pass to mongo
			var query = {
					_id: 'id' in params ? mongojs.ObjectId(params.id) : mongojs.ObjectId(request.auth.credentials.id),
					profileId: null,
					datetime: null
			};
	
	
			//delete to and from keys from query if they are not given
			if (!('from' in params) && !('to' in params)) {
				delete query.datetime;
			}
			else {
		
				//from and to both given
				if (('from' in params) && ('to' in params)) {
					query.datetime = {
							//create iso string from passed in date
							$gte: params.from.toISOString(),
							$lte: params.to.toISOString()
					}
				}
				//only from given
				else if ('from' in params) {
					query.datetime = {
							$gte: params.from.toISOString()
					};
				}
				//only to given
				else {
					query.datetime = {
							$lte: params.to.toISOString()
					};
				}
			}
			//if id passed as a query parameter set profileid to it
			if ('id' in params) {
				query.profileId = params.id;
			}
			//if no id query paramter delete profileid key from query
			else {
				delete query.profileId;
			}
			
			// first check if the given user id exists
			db.collection('user').findOne({_id: query._id}, (err, doc) => {
				//id not found return 4o0 bad request
				if (err) {
					response = {
							statusCode: 400,
							error: 'Error finding scans for given user',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				//id not found return 400 bad request
				else if(!doc) {
					response = {
							statusCode: 400,
							error: 'Error finding scans for given user',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				//id found. Now search through scans for scnas with this profle id
				else {
					//delete _od key from query so we dont restrict
					//scans lookup to scans with that id
					delete query._id;
					
					//search through scans to get all scnas with given parameters
					db.collection('scans').find(query, (err, docs) => {
						//error
						if (err) {
							response = {
									statusCode: 400,
									error: 'Error finding scans for given user',
									message: 'Error in database lookup'
							};
							return reply(response).code(400);
						}
						
						//no error return scans after copying them
						//into array
						var scans = new Array();
						for (var i = 0; i < docs.length;i++) {
							var newScan = {
									_id: docs[i]._id.toString(),
									profileId: docs[i].profileId,
									datetime: docs[i].datetime,
									mapIds: docs[i].mapIds,
									scannedValue: docs[i].scannedValue,
									location: {
										type: docs[i].location.type,
										coordinates: docs[i].location.coordinates
										
									}
							};
							if (docs[i].data) {
								newScan.data = docs[i].data;
							};
							scans.push(newScan);
						}
						return reply(scans).code(200);
					})
				}
			})
			
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
			},
			validate: {
				query: {
					//none
				},
				params: {
					//none
				},
				payload: {
					profileId: Joi.string().length(24).required(),
					mapIds: Joi.array().items(Joi.string().length(24)).required(),
					scannedValue: Joi.string().required(),
					location: Joi.object().keys({
						type: Joi.string().required(),
						coordinates: Joi.array().required()
					}).required(),
					data: Joi.object()
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						message: Joi.string().required(),
						scan: scanSchema
					}),
					400: errorSchema,
					500: errorSchema
				}
			}
		},
		method: 'POST',
		path: '/scans',
		handler: function (request, reply) {
			
			//get scan from body
			const scan = request.payload;
			
			
			//creates date in ISO format and assigns it to scan datetime
			var date = moment().utc(utcOffsetPST).toISOString(); 
		    scan.datetime = date;
			
			//add scan to database
			db.collection('scans').save(scan, (err, result) => {
				if (err) {
					const response = {
							statusCode: 400,
							error: err,
							message: 'Error occured when trying to add scan'
					};
					reply(response).code(400);
				}
				//succesffuly added
				else {
					
					//copy result into new scan object then return it
					var newScan = {
							_id: result._id.toString(),
							profileId: result.profileId,
							datetime: result.datetime,
							mapIds: result.mapIds,
							scannedValue: result.scannedValue,
							location: {
								type: result.location.type,
								coordinates: result.location.coordinates
							}
							
					};
					if (result.data) {
						newScan.data = result.data;
					}
					const response = {
							message: 'scan added',
							scan: newScan
					};
					//return added scan and success message
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
			},
			validate: {
				query: {
					//none
				},
				params: {
					userId: Joi.string().length(24).required()
				}
			},
			response: {
				status: {
					200: Joi.array().items(Joi.object().keys({
						coord: Joi.array(),
						id: Joi.string().length(24)
					})),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/scans/{userId}/coord',
		handler: function (request, reply) {
			
			//get userid from url
			const uid = request.params.userId;
			
			const id = mongojs.ObjectId(uid);
			
			db.collection('user').findOne({_id: id}, (err,doc) => {
				//user not found
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error getting users scans',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error getting users scans',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				else {
					//search database for scans by this user
					db.collection('scans').find({profileId: uid}, function(err, docs) {
						
						if (err) {
							var response = {
									statusCode: 400,
									error: 'Error getting user scans',
									message: 'Error in database lookup'
							};
							return reply(response).code(400);
						}
						
						
						
						//extract coordinates and id from each doc
						var coords = new Array();
						for (var i = 0; i < docs.length;i++) {
							const res = {
									coord: docs[i].location.coordinates,
									id: docs[i]._id.toString()
							};
							coords.push(res);
						}
						
				
						return reply(coords).code(200);
						
					})
				}
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
			},
			validate: {
				query: {
					//none
				},
				params: {
					id: Joi.string().length(24).required()
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						scans: scanSchema
					}),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/scans/{id}',
		handler: function (request, reply) {
			
			//parse id from url
			const id = request.params.id;
			
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.collection('scans').findOne({_id: objID}, (err, doc) => {
				//error in lookup
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error retreiving scan from database',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				//scan not found
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error retreiving scan from database',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				//scan found
				else {
					//copy scan from database into new object
					var scan = {
							_id: doc._id.toString(),
							profileId: doc.profileId,
							datetime: doc.datetime,
							mapIds: doc.mapIds,
							scannedValue: doc.scannedValue,
							location: {
								type: doc.location.type,
								coordinates: doc.location.coordinates
							}
					};
					if (doc.data) {
						scan.data = doc.data;
					}
					const response = {
						scans: scan
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
			},
			validate: {
				query: {
					//none
				},
				params: {
					id: Joi.string().length(24).required()
				},
				payload: {
					profileId: Joi.string().length(24).required(),
					datetime: Joi.date().required(),
					mapIds: Joi.array().required(),
					scannedValue: Joi.string().required(),
					location: Joi.object().keys({
						type: Joi.string().required(),
						coordinates: Joi.array().required()
					}).required(),
					data: Joi.object()
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						message: Joi.string(),
						scan: scanSchema
					}),
					400: errorSchema
				}
			}
		},
		method: 'PUT',
		path: '/scans/{id}',
		handler: function (request, reply) {
			
			//parse id from url
			const id = request.params.id;
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			const scan = request.payload;
			
			
			//search for scan and update it with passed in scan if it exists
			db.collection('scans').findAndModify({
				query: {_id: objID},
				update: {
					profileId: scan.profileId,
					mapIds: scan.mapIds,
					scannedValue: scan.scannedValue,
					location: scan.location,
					datetime: scan.datetime
				}
			}, (err, doc, lastErrorObject) => {
				//error updating doc
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error updating scan',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				//given scan not found
				if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error updating scan',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				
				//scan exists
				//copy new scan object from doc
				var scan = {
						_id: doc._id.toString(),
						profileId: doc.profileId,
						datetime: doc.datetime,
						mapIds: doc.mapIds,
						scannedValue: doc.scannedValue,
						location: {
							type: doc.location.type,
							coordinates: doc.location.coordinates
						}
				};
				if (doc.data) {
					scan.data = doc.data;
				}
				return reply({message: 'Scan successfully updated', scan: scan}).code(200);
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
			},
			validate: {
				query: {
					//none
				},
				params: {
					id: Joi.string().length(24)
				}
			},
			response: {
				status: {
					200: Joi.array().items(mapSchema),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/scans/{id}/maps',
		handler: function (request, reply) {
			
			//get id from url
			const id = request.params.id;
			
			//create mongo id object
			const objID = mongojs.ObjectId(id);
			
			db.collection('scans').findOne({_id: objID}, (err, doc) => {
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error finding scans',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error finding scans',
							message: 'Given scan id does not exist'
					};
					return reply(response).code(400);
				}
				else {
					const mapIds = new Array();
					for (var i = 0; i < doc.mapIds.length;i++) {
						mapIds.push(mongojs.ObjectId(doc.mapIds[i].toString()));
					}
					
					var query = {
							_id : {
								$in: mapIds
							}
					};
					//now get map object for every fetched map
					db.collection('Maps').find( query, (err,docs) => {
						if (err) {
							var response = {
									statusCode: 400,
									error: 'Error finding maps',
									message: 'Error in searching for this scans maps'
							};
							return reply(response).code(400);
						}
						
						var maps = new Array();
						for (var i = 0; i < docs.length;i++) {
							var newMap = {
									_id: docs[i]._id.toString(),
									type: docs[i].type,
									name: docs[i].name,
									createdAt: docs[i].createdAt,
									shape: docs[i].shape
							};
							maps.push(newMap);
						}
						return reply(maps).code(200);
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
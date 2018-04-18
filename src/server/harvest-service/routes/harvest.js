/**
 * 
 */



const mongojs = require('mongojs');
var turf_methods = require('../turf_methods');
const plotlyConfig = require('../config/plotly');
var plotly = require('plotly')(plotlyConfig.username,plotlyConfig.apiKey );
var http = require('http');
var https = require('https');
var request = require('request');
var bodyParser = require('body-parser');
var Joi = require('joi');
var fs = require('fs');
var moment = require('moment');
//utc offset for Pacific Standard Time (8 hours behind)
const utcOffsetPST = "-8:00"

//schemas
var errorSchema = require('../schemas/error/error-schema');
var scanSchema = require('../schemas/scan/scan-schema');




/*formats date from MMDDYYYY to MM/DD/YYYY
 * 
 * Parameters:
 * 		date: string in format MMDDYYYY
 * 
 * Output:
 * 		date: string in format MM/DD/YYYY
 */
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

function formatDateForGraph(date) {
	
	if (date.length != 8 && date.length != 10) {
		return date;
	}
	
	if (date.indexOf('-') > -1) {
		return date;
	}
	else {
		var newDate = date.slice(4,10) + '-' + date.slice(0,2) + '-' + date.slice(2,4);
		return newDate
	}
}


/* checks if date check is within the dates from and to
 * 
 * Parameters:
 * 		from (string) : start date of time frame MM/DD/YYYY
 * 		to (string) : end date of time frame MM/DD/YYYY
 * 		check (string) : date to check if in timeframe MM/DD/YYYY
 * 
 * Output
 * 		true: date is in the time frame of fromDate to toDate
 * 		false: date out of time frame of fromDate to toDate
 */
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
	

	
	
	
	/*
	 * Gets avg dist of crates in a specified time frame
	 * 
	 * Request:
	 * 		GET
	 * 		Query parameters:
	 * 			required 'id': id of user who owns the scans
	 * 			required 'to' (date) : start date in format MMDDYYYY
	 * 			required 'from' (date) : end date in format MMDDYY
	 * 			unit (string) : unit of distance
	 * 
	 * Response:
	 * 		400 - invalid parameters given (probably wrong date format)
	 * 		200 - Success. Calculation is given in body of reponse
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			validate: {
				query: {
					from: Joi.date().required(),
					to: Joi.date().required(),
					id: Joi.string().length(24),
					unit: Joi.string()
				},
				params: {
					//none
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						unit: Joi.string().required(),
						meandist: Joi.number().required(),
						distance: Joi.object().required()
					}),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/harvest/meandist',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			//id of user who is authenticated
			const currUserId = request.auth.credentials.id;
			
			//query parameter to search for in database
			var query = {
					profileId: 'id' in params ? params.id : currUserId,
					datetime: null
			};
			
			//no date query parameters given. Delete datetime key from query
			if (!('from' in params) && !('to' in params)) {
				delete query.datetime;
			}
			//date queries given
			else {
				//from and to both given
				if (('from' in params) && ('to' in params)) {
					
					//midnight of given start date
					var startDate = moment(params.from).toISOString();
					//11:59 PM of given end date
					var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
					
					//midnight of given end date
					var startTo = moment(params.to).utc().startOf('day').toISOString();
					
					//if searching for a given day in format YYYY-MM-DD and both days on same date
					//then make start 11:59 PM of the prev day and make end search
					//midnight of target day
					if (params.to.toISOString() == params.from.toISOString()) {
						
						query.datetime = {
								$gte: startDate,
								$lte: endDate
						};
						
					}
					//given from and start dates are on different days
					//now narrow down search to see if they have time properties
					//in format YYYY-MM-DDTHH:mm:ss
					else {
						//if the given end date specifies a specific time on that day
						//then use that date in format YYYY-MM-ddTHH:mm:ssZ
						if (params.to.toISOString() > startTo) {
							
							query.datetime = {
									$gte: params.from.toISOString(),
									$lte: params.to.toISOString()
							};
						}
						//no specific time given on end date so search in time frame
						//from given start date to the given end date at 11:59 PM
						else {
							var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
							
							query.datetime = {
									//create iso string from passed in date
									$gte: params.from.toISOString(),
									$lte: endDate
							}
						}
						
					
					}
					
					
				}
				
			}
			
			const unit = 'unit' in params ? params.unit : 'miles';
			if (unit != 'miles' && unit != 'kilometers' && unit != 'ft') {
				var response = {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Unit query ' + unit + ' is invalid. Supported units are miles, kilometers and feet'
				};
				return reply(response).code(400);
			}
			
			
			//check if given user id exists
			const objId = mongojs.ObjectId(query.profileId);
			db.collection('user').findOne({_id: objId}, (err, doc) => {
				//user not found
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error getting crate data',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				//id not found
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error getting crate data',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				//id found
				else {
				
					//get all scans from database that fir into this time period
					db.collection('scans').find(query, (err, docs) => {
							
						//error searching database
						if (err) {
							return reply(err).code(500);
						}
					
						//dictionary to hold distance data for each scan id
						var distances = {}
						
						//calculate avg dist
						//sort by date ascending order
						docs.sort(function (a,b) {
							return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
						});
						
						//only one or zero d\ocuments gotten
						if (docs.length == 1) {
							distances[docs[0]._id] = {
									scan: {
										_id: docs[0]._id.toString(),
										profileId: docs[0].profileId,
										mapIds: docs[0].mapIds,
										scannedValue: docs[0].scannedValue,
										
										location: docs[0].location,
										data: docs[0].data,
										datetime: docs[0].datetime
									},
									time_frame: docs[0].datetime.slice(0,10) + ' to ' + docs[0].datetime.slice(0,10),
									distance: 0
							};
							const meandist = {
									unit: unit,
									meandist : 0,
									distance: distances
							};
							return reply(meandist).code(200);
						}
						
						//total distance
						var dist = 0;
						//number of records (used lated to calculate avg)
						var num_calculations = 0;
						//loop through scans backwards (oldest to newest)
						for (var i = docs.length - 1; i > 0;i--) {
							var coords1, coords2;
							
							//parse coordinates from scans
							//scan coordinates is either array of coordinate arrays
							//or just 1 array with the coordinates
							if (docs[i].location.coordinates[0] instanceof Array) {
								coords1 = docs[i].location.coordinates[0];
								
							}
							else {
								coords1 = docs[i].location.coordinates;
								
							}
							
							if (docs[i - 1].location.coordinates[0] instanceof Array) {
								coords2 = docs[i - 1].location.coordinates[0];
								
							}
							else {
								coords2 = docs[i - 1].location.coordinates;
								
							}
							
							
							//older scan
							const scan1 = {
									lat: coords1[0],
									lng: coords1[1]
							};
							//newer scan
							const scan2 = {
									lat: coords2[0],
									lng: coords2[1]
							};
							
							
							
							
							//get distance between the scans
							var d;
							switch (unit) {
								//if unit is feet get miles then convert to feet
								case 'ft':
									var miles = turf_methods.distance(scan1,scan2,'miles');
									d = miles * 5280;
									break;
								//else just plug in unit
								default:
									d = turf_methods.distance(scan1,scan2,unit);
							}
							
							
							//add distance to total
							dist += d;
							
							//get only YYYY-MM-dd component of datetime (used for graph)
							var date2 = docs[i].datetime.slice(0,10);
							var date1 = docs[i-1].datetime.slice(0,10);
							
							
							var date = date1 + ' to ' + date2;
							distances[docs[i]._id] = {
									scan: {
										_id: docs[i]._id.toString(),
										profileId: docs[i].profileId,
										mapIds: docs[i].mapIds,
										scannedValue: docs[i].scannedValue,
										
										location: docs[i].location,
										data: docs[i].data,
										datetime: docs[i].datetime
									},
									time_frame : date,
									distance: d
							}
							num_calculations ++;
							
							//last loop add the docs[0] which is left out of loop
							if (i == 1) {
								distances[docs[i-1]._id] = {
										scan: {
											_id: docs[0]._id.toString(),
											profileId: docs[0].profileId,
											mapIds: docs[0].mapIds,
											scannedValue: docs[0].scannedValue,
											
											location: docs[0].location,
											data: docs[0].data,
											datetime: docs[0].datetime
										},
										time_frame: distances[docs[i]._id].time_frame,
										distance: distances[docs[i]._id].distance
								}
							}
						}
						
						
						
						const meandist = {
								unit: unit,
								meandist : num_calculations > 0 ? dist / num_calculations : dist / 1,
								distance: distances
						};
						reply(meandist).code(200);
						
					})
				}
			})
			
		}
	});
	
	
	
	/*
	 * Returns number of crates harvested on a given day
	 * 
	 * Request:
	 * 		GET
	 * 		Query parameters:
	 * 			&date (string) : date of harvest in format MMDDYYYY
	 * Response:
	 * 		400 - Invalid date given as parameter
	 * 		200 - Success. Returns number of crates harvested on the given
	 * 			day and an array of the crate objects
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			validate: {
				query: {
					date: Joi.date().required(),
					id: Joi.string().length(24)
				},
				params: {
					//none
				}
			}
		},
		method: 'GET',
		path: '/harvest/numcrates',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			
			var startDate = params.date.toISOString();
			var endDate = moment(startDate).add(1, 'days').toISOString();
			
			
			var currUserId = request.auth.credentials.id;
			var profileId = 'id' in params ? params.id : currUserId;
			
			var query = {
					datetime: {
						$gte: startDate,
						$lt: endDate
					},
					profileId: profileId
			};
			
			//search database to see if given user id is valid
			const objId = mongojs.ObjectId(profileId);
			db.collection('user').findOne({_id: objId}, (err, doc) => {
				//user not found
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error getting crate data',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				//id not found
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error getting crate data',
							message: 'Given user id does not exist'
					};
					return reply(response).code(400);
				}
				else {
				
					db.collection('scans').find(query, function (err, docs) {
						if (err) {
							return reply('Error getting crate data.' + err).code(400);
						}
						const response = {
								numCrates: docs.length,
								crates: docs
						};
						return reply(response).code(200);
					})
				}
			})
			
			
			
		
		}
	});
	
	
	/*
	 * Gets number of crates harvested in a given time frame
	 * 
	 * Request:
	 * 		GET
	 * 		Query Params:
	 * 			&id : user id of the crate owner
	 * 			&from: start date of time frame MMDDYYYY
	 * 			&to: end date of time frame MMDDYYYY
	 * Response:
	 * 		400 - Bad Request. Missing a date, bad date format
	 * 		200 - Success. Number of crates and array of crate objects in body
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
					from: Joi.date().required(),
					to: Joi.date().required(),
					groupBy: Joi.string()
				},
				params: {
					//none
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						numCrates: Joi.number().required(),
						cratesPerDay: Joi.object().required(),
						crates: Joi.array().items(scanSchema)
					}),
					400: errorSchema
					
				}
			}
		},
		method: 'GET',
		path: '/harvest/numcrates/between',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			var d = moment().utc(utcOffsetPST).format();
			
			
			const currUserId = request.auth.credentials.id;
			const profileId = 'id' in params ? params.id : currUserId;
			
			var groupBy = 'groupBy' in params ? params.groupBy : 'day';
			
			if (groupBy != 'hr' && groupBy != 'day') {
				var response = {
						statusCode: 400,
						error: 'Invalid groupBy parameter given',
						message: 'Group by must either be value day or hr'
				};
				return reply(response).code(400);
			}
			
			var query = {
					profileId: profileId,
					datetime: null
			};
			
			//no date query parameters given. Delete datetime key from query
			if (!('from' in params) && !('to' in params)) {
				delete query.datetime;
			}
			//date queries given
			else {
				//from and to both given
				if (('from' in params) && ('to' in params)) {
					
					//midnight of given start date
					var startDate = moment(params.from).toISOString();
					//11:59 PM of given end date
					var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
					
					//midnight of given end date
					var startTo = moment(params.to).utc().startOf('day').toISOString();
					
					//if searching for a given day in format YYYY-MM-DD and both days on same date
					//then make start 11:59 PM of the prev day and make end search
					//midnight of target day
					if (params.to.toISOString() == params.from.toISOString()) {
						
						query.datetime = {
								$gte: startDate,
								$lte: endDate
						};
						
					}
					//given from and start dates are on different days
					//now narrow down search to see if they have time properties
					//in format YYYY-MM-DDTHH:mm:ss
					else {
						//if the given end date specifies a specific time on that day
						//then use that date in format YYYY-MM-ddTHH:mm:ssZ
						if (params.to.toISOString() > startTo) {
							console.log('greater');
							query.datetime = {
									$gte: params.from.toISOString(),
									$lte: params.to.toISOString()
							};
						}
						//no specific time given on end date so search in time frame
						//from given start date to the given end date at 11:59 PM
						else {
							var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
							console.log('enddate = ' + endDate);
							query.datetime = {
									//create iso string from passed in date
									$gte: params.from.toISOString(),
									$lte: endDate
							}
						}
						
					
					}
					
					
				}
				
			}
			
			
			//check if given user id is valid
			db.collection('user').findOne({_id: mongojs.ObjectId(profileId)}, (err,doc) => {
				if (err) {
					var response = {
							statusCode: 400,
							error: 'Error getting scan data',
							message: 'ser id not found'
					}
					return reply(response).code(400);
				}
				else if (!doc) {
					var response = {
							statusCode: 400,
							error: 'Error getting scan data',
							message: 'ser id not found'
					}
					return reply(response).code(400);
				}
				else {
					//get all scans from database that fir into this time period
					db.collection('scans').find(query, (err, docs) =>{
						
						//error searching database
						if (err) {
							var response = {
									statusCode: 400,
									error: 'Error getting scan data',
									message: 'Scan not found'
							}
							return reply(response).code(400);
						}
						
						//sort by date ascending order
						docs.sort(function (a,b) {
							return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
						});
						
						
						
						//copy docs into new array to avoid overwriting them
						var scans = new Array();
						for (var i = 0; i < docs.length;i++) {
							var newScan = {
									_id: docs[i]._id.toString(),
									profileId: docs[i].profileId,
									mapIds: docs[i].mapIds,
									scannedValue: docs[i].scannedValue,
									location: {
										type: docs[i].location.type,
										coordinates: docs[i].location.coordinates
									},
									datetime: docs[i].datetime
							};
							scans.push(newScan);
						}
						
						//get number of crates for each day in the time frame
						var cratesPerDay = {};
						for (var i = 0 ; i < scans.length;i++) {
							//MMDDYYYY
							//YYYY-MM-DD
							
							if (params.to.toISOString().slice(0,10) == params.from.toISOString().slice(0,10) ||
									groupBy == 'hr') {
								console.log('in');
								var date = scans[i].datetime.slice(0,13);
								var occurences = 0;
								for (var j = 0; j < scans.length;j++) {
									if (docs[j].datetime.slice(0,13) == date) {
										occurences++;
										
									}
									cratesPerDay[date + ':00:00Z'] = occurences;
								}
							}
							else {
								var date = scans[i].datetime.slice(0,10);
								var occurences = 0;
								for (var j = 0; j < scans.length;j++) {
									if (docs[j].datetime.slice(0,10) == date) {
										occurences++;
									
									}
								
								}
							
								cratesPerDay[date] = occurences;
							}
						}
						
						var response = {
								numCrates: scans.length,
								cratesPerDay: cratesPerDay,
								crates: scans
								
						};
						return reply(response).code(200);
						
					})
				}
			})
		}
	});
	
	
	
	/*
	 * Calculates avg time between crate scans
	 * 
	 * Request:
	 * 		GET
	 * 		Optional Query parameters:
	 * 			&id (string) required) : id of the user who owns the crates
	 * 			&from (string) required: start date of time frame
	 * 			&to (string) required: end date of time frame
	 * 			&unit (unit of time) required: 'day', 'hr' , 'min' , 'sec'
	 * 
	 * Response:
	 * 		400 - Bad request. Date format invalid or invalid dates given
	 * 		200 - Returns meant time between crates in body
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			validate: {
				query: {
					from: Joi.date().required(),
					to: Joi.date().required(),
					id: Joi.string().length(24),
					unit: Joi.string()
				},
				params: {
					//none
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						meantime: Joi.number(),
						crates: Joi.object()
					}),
					400: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/harvest/meantime',
		handler: function (request, reply) {
			
			//get query parameters
			const params = request.query;
			
			var unit = 'unit' in params ? params.unit : 'min';
			
			//build query to search for in scans collection
			var query = {
					profileId: 'id' in params ? params.id : request.auth.credentials.id,
					datetime: null
			};
			//no date query parameters given. Delete datetime key from query
			if (!('from' in params) && !('to' in params)) {
				delete query.datetime;
			}
			//date queries given
			else {
				//from and to both given
				if (('from' in params) && ('to' in params)) {
					
					//midnight of given start date
					var startDate = moment(params.from).toISOString();
					//11:59 PM of given end date
					var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
					
					//midnight of given end date
					var startTo = moment(params.to).utc().startOf('day').toISOString();
					
					//if searching for a given day in format YYYY-MM-DD and both days on same date
					//then make start 11:59 PM of the prev day and make end search
					//midnight of target day
					if (params.to.toISOString() == params.from.toISOString()) {
						
						query.datetime = {
								$gte: startDate,
								$lte: endDate
						};
						
					}
					//given from and start dates are on different days
					//now narrow down search to see if they have time properties
					//in format YYYY-MM-DDTHH:mm:ss
					else {
						//if the given end date specifies a specific time on that day
						//then use that date in format YYYY-MM-ddTHH:mm:ssZ
						if (params.to.toISOString() > startTo) {
							console.log('greater');
							query.datetime = {
									$gte: params.from.toISOString(),
									$lte: params.to.toISOString()
							};
						}
						//no specific time given on end date so search in time frame
						//from given start date to the given end date at 11:59 PM
						else {
							var endDate = moment(params.to).utc(utcOffsetPST).add(1,'days').endOf('day').toISOString();
							
							query.datetime = {
									//create iso string from passed in date
									$gte: params.from.toISOString(),
									$lte: endDate
							}
						}
						
					
					}
					
					
				}
				
			}
			
		
			db.collection('scans').find(query ,(err,docs) => {
				
				if (err) {
					return reply(err).code(500);
				}
				
				
				var validScans = new Array();
				for (var i = 0; i < docs.length;i++) {
					var newScan = {
							_id: docs[i]._id.toString(),
							profileId: docs[i].profileId,
							mapIds: docs[i].mapIds,
							scannedValue: docs[i].scannedValue,
							location: {
								type: docs[i].location.type,
								coordinates: docs[i].location.coordinates
							},
							datetime: docs[i].datetime
					};
					validScans.push(newScan);
				}
				
				//sort by date ascending order
				validScans.sort(function (a,b) {
					return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
				});
			
				//calculate avg time between crates
				var time = 0.0;
				var crates = {};
				for (var i = validScans.length - 1; i > 0; i--) {
					
					
					//get time difference between crates
					var d1 = new Date(validScans[i - 1].datetime);
					var d2 = new Date(validScans[i].datetime);
					var diff = d2 - d1;
					
					//convert to given unit
					switch (unit) {
						case 'day':
							diff = diff / 86400000;
							break;
						case 'hr':
							diff = diff / 3600000;
							break;
						case 'min':
							diff = diff / 60000;
							break;
						//seconds
						default:
							diff = diff / 1000;
					}
					
					time += diff;
					crates[validScans[i]._id.toString()] = {
							time_frame: validScans[i].datetime + ' to ' + validScans[i-1].datetime,
							time: diff,
							unit: unit,
							crate: {
								_id: validScans[i]._id.toString(),
								profileId: validScans[i].profileId,
								mapIds: validScans[i].mapIds,
								scannedValue: validScans[i].scannedValue,
								location: validScans[i].location,
								datetime: validScans[i].datetime
							}
					
					}
					
					if (i == 1) {
						crates[validScans[0]._id.toString()] = {
								time_frame: validScans[0].datetime + ' to ' + validScans[0].datetime,
								time: diff,
								unit: unit,
								crate: {
									_id: validScans[0]._id.toString(),
									profileId: validScans[0].profileId,
									mapIds: validScans[0].mapIds,
									scannedValue: validScans[0].scannedValue,
									location: validScans[0].location,
									datetime: validScans[0].datetime
								}
						
						}
					}
					
					
					
				}
				
				//sort times in ascneding order before returning
				var keys = [];
				for (var key in crates) {
					keys.push(crates[key]);
				}
				keys.sort(function (a,b) {
					return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
				});
				
				var length = validScans.length > 1 ? validScans.length - 1 : 1;
				var avgTime = time / length;
				const response = {
						meantime: avgTime,
						crates: crates
				};
				return reply(response).code(200);
				
			})
		}
	});
	
	
	
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			validate: {
				query: {
					from: Joi.date().required(),
					to: Joi.date().required(),
					id: Joi.string().length(24),
					unit: Joi.string()
				},
				params: {
					//none
				}
			}
		},
		method: 'GET',
		path: '/harvest/statistics',
		handler: function (request, reply) {
			
			
		}
	});
	
	
	
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-harvest'
};
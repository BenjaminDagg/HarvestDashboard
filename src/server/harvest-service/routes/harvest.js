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

var fs = require('fs');





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
			}
		},
		method: 'GET',
		path: '/harvest/meandist',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			//check if either data parameter is missing
			if (!('from' in params) || !('to' in params)) {
				return reply({error: 'Missing required parameters'}).code(400);
			}
			
			//parse parameters
			var from = params.from;
			var to = params.to;
			var uid = params.id;
			var query = (uid == undefined) ? {} : {profileId: uid};
			//check if invalid dates
			if (from.length != 8 || to.length != 8 || (formatDate(to) < formatDate(from))) {
				return reply({error: 'Invalid date format. Date must be in format MMDDYYYY'}).code(400);
			}
			
			//get all scans from database that fir into this time period
			db.collection('scans').find(query, (err, docs) => {
					
				//error searching database
				if (err) {
					return reply(err).code(500);
				}
				else if (!docs) {
					return reply('No scans found').code(400);
				}
				from = formatDate(from);
				to = formatDate(to);
				
				//get only scans withing the time frame
				var scans = docs;
				var validScans = new Array();

				for (var i = 0; i < scans.length;i++) {
					const date = formatDate(scans[i].datetime);

					if (dateCheck(from,to,date) == true) {
						validScans.push(scans[i]);
					}
				}
				
				//if no valid scans send a bad request
				if (validScans.length == 0) {
					return reply('No scans found in this time period').code(400);
				}
				
				var distances = {}
				
				//calculate avg dist
				//sort by date
				validScans.sort(function (a,b) {
					var dateA = formatDate(a.datetime);
					var dateB = formatDate(b.datetime);
					
					var a = dateA.split('/');
					var b = dateB.split('/');
					
					return b[2] - a[2] || b[0] - a[0] || b[1] - a[1];
				});
				
				
			
				var dist = 0;
				var num_calculations = 0;
				for (var i = validScans.length - 1; i > 0;i--) {
					var coords1, coords2;
					
					
					if (validScans[i].location.coordinates[0] instanceof Array) {
						coords1 = validScans[i].location.coordinates[0];
						
					}
					else {
						coords1 = validScans[i].location.coordinates;
						
					}
					
					if (validScans[i - 1].location.coordinates[0] instanceof Array) {
						coords2 = validScans[i - 1].location.coordinates[0];
						
					}
					else {
						coords2 = validScans[i - 1].location.coordinates;
						
					}
					
					
					
					const scan1 = {
							lat: coords1[0],
							lng: coords1[1]
					};
					
					const scan2 = {
							lat: coords2[0],
							lng: coords2[1]
					};
					var d = turf_methods.distance(scan1,scan2,'miles');
					dist += d;
					var date2 = formatDateForGraph(validScans[i].datetime);
					var date1 = formatDateForGraph(validScans[i-1].datetime);
					
					
					var date = date2 + ' to ' + date1;
					distances[validScans[i]._id] = {
							time_frame : date,
							distance: d
					}
					num_calculations ++;
				}
				
				
				
				const meandist = {
						meandist : dist / num_calculations,
						distance: distances
				};
				reply(meandist).code(200);
				
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
			}
		},
		method: 'GET',
		path: '/harvest/numcrates',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			if (!('date' in params)) {
				return reply('Missing parameters').code(400);
			}
			
			const date = params.date;
			var uid = params.id;
			var query = (uid == undefined) ? {datetime: date} : {profileId: uid, datetime: date}; 
			//check if date is in invalid format
			if (date.length != 8) {
				return reply('Missing parameters').code(400);
			}
			
			db.collection('scans').find({datetime: date}, function (err, docs) {
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
			}
		},
		method: 'GET',
		path: '/harvest/numcrates/between',
		handler: function (request, reply) {
			
			//get query parameters from url
			const params = request.query;
			
			//check if either data parameter is missing
			if (!('from' in params) || !('to' in params)) {
				return reply({error: 'Missing parameters.'}).code(400);
			}
			
			//parse parameters
			var from = formatDate(params.from);
			var to = formatDate(params.to);
			var uid = params.id;
			var query = (uid == undefined) ? {} : {profileId: uid};
			
			//check if invalid dates
			if (from.length != 10 || to.length != 10 || (formatDate(to) < formatDate(from))) {
				return reply('Invalid date format').code(400);
			}
			
			//get all scans from database that fir into this time period
			db.collection('scans').find(query, (err, docs) =>{
				
				//error searching database
				if (err) {
					return reply(err).code(500);
				}
				
				
				
				//get only scans withing the time frame
				var scans = docs;
				var validScans = new Array();

				for (var i = 0; i < scans.length;i++) {
					const date = formatDate(scans[i].datetime);

					if (dateCheck(from,to,date) == true) {
						validScans.push(scans[i]);
					}
				}
				
				//get number of crates for each day in the time frame
				var cratesPerDay = {};
				for (var i = 0 ; i < validScans.length;i++) {
					//MMDDYYYY
					//YYYY-MM-DD
					var date = formatDate(validScans[i].datetime);
					var occurences = 0;
					for (var j = 0; j < validScans.length;j++) {
						if (formatDate(validScans[j].datetime) == date) {
							occurences++;
							
						}
						
					}
					
					cratesPerDay[formatDateForGraph(validScans[i].datetime)] = occurences;
				}
				
				const response = {
						numCrates: validScans.length,
						cratesPerDay: cratesPerDay,
						crates: validScans
						
				};
				return reply(response).code(200);
				
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
	 * 			&unit (unit of time) required: hour, days, min. If none given default is hours
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
			}
		},
		method: 'GET',
		path: '/harvest/meantime',
		handler: function (request, reply) {
			
			//get query parameters
			const params = request.query;
			
			//check if paramters missing
			if (!('from' in params) || !('to' in params)) {
				return reply({error: 'Missing parameters.'}).code(400);
			}
			
			var fromDate = formatDate(params.from);
			var toDate = formatDate(params.to);
			var uid = params.id;
			var query = (uid == undefined) ? {} : {profileId: uid}; // check whether one or all user's crates
		
			db.collection('scans').find(query ,(err,docs) => {
				
				if (err) {
					return reply(err).code(500);
				}
				
				//filter results to only show scans falling in the time range
				var validScans = new Array();
				
				for (var i = 0; i < docs.length;i++) {
					var date = formatDate(docs[i].datetime);
					if (dateCheck(fromDate,toDate,date) == true) {
						validScans.push(docs[i]);
						console.log(docs[i]);
					}
				}
				
				//sort by date ascending
				validScans.sort(function (a,b) {
					var dateA = formatDate(a.datetime);
					var dateB = formatDate(b.datetime);
					
					var a = dateA.split('/');
					var b = dateB.split('/');
					
					return b[2] - a[2] || b[0] - a[0] || b[1] - a[1];
				});
				
				//calculate avg time between crates
				var time = 0.0;
				var times = {};
				for (var i = validScans.length - 1; i > 0; i--) {
					
					var d1 = new Date(formatDate(validScans[i].datetime));
					var d2 = new Date(formatDate(validScans[i-1].datetime));
					var diff = Math.abs(d1.getTime() - d2.getTime());
					
					var scanId = validScans[i]._id;
					var time_frame = formatDateForGraph(validScans[i].datetime) + ' to ' + formatDateForGraph(validScans[i-1].datetime);
					
					
					if ('unit' in params) {
						const unit = params.unit;
						
						switch(unit) {
							case 'hour':
								var hours = Math.ceil(diff / (3600000));
								time += hours;
								times[scanId] = {
										time_frame: time_frame,
										time: hours
								};
								break;
							case 'min':
								var min = Math.ceil(diff / 60000);
								time += min;
								times[scanId] = {
										time_frame: time_frame,
										time: min
								}
								break;
							default:
								var days = Math.ceil(diff / (1000 * 3600 * 24));
								time += days;
								times[scanId] = {
										time_frame: time_frame,
										time: days
								};
								
						}
					} else {
						var hours = Math.ceil(diff / (3600000));
						time += hours;
						times[scanId] = {
								time_frame: time_frame,
								time: hours
						};
					}
					
					
				}
				
				//sort times in ascneding order before returning
				var keys = [];
				for (var key in times) {
					keys.push(times[key]);
				}
				keys.sort(function (a,b) {
					
					var dateA = formatDate(a.time_frame.slice(0,10));
					var dateB = formatDate(b.time_frame.slice(0,10));
					
					
					
					var a = dateA.split('/');
					var b = dateB.split('/');
					
					return b[2] - a[2] || b[0] - a[0] || b[1] - a[1];
				});
				
				var length = validScans.length > 1 ? validScans.length - 1 : 1;
				var avgTime = time / length;
				const response = {
						meantime: avgTime,
						times: times
				};
				return reply(response).code(200);
				
			})
		}
	});
	
	
	
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-harvest'
};
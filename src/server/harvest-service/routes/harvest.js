/**
 * 
 */



const mongojs = require('mongojs');
var turf_methods = require('../turf_methods');


/*formats date from MMDDYYYY to MM/DD/YYYY
 * 
 * Parameters:
 * 		date: string in format MMDDYYYY
 * 
 * Output:
 * 		date: string in format MM/DD/YYYY
 */
function formatDate(date) {
	if (date.length != 8) {
		return date;
	}
	
	return date.slice(0, 2) + "/" + date.slice(2, 4) + "/" + date.slice(4, 8);
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
				return reply('Missing parameters.').code(400);
			}
			
			//parse parameters
			var from = params.from;
			var to = params.to;
			
			//check if invalid dates
			if (from.length != 8 || to.length != 8 || (formatDate(to) < formatDate(from))) {
				return reply('Invalid date format').code(400);
			}
			
			//get all scans from database that fir into this time period
			db.collection('scans').find(function (err, docs) {
				
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
				
				//calculate avg dist
				//sort by date
				validScans.sort(function (a,b) {
					return (formatDate(b.datetime)) < (formatDate(a.datetime));
				});
			
				var dist = 0;
				for (var i = validScans.length - 1; i > 0;i--) {
					const coords1 = validScans[i].location.coordinates[0];
					const scan1 = {
							lat: coords1[0],
							lng: coords1[1]
					};
					const coords2 = validScans[i - 1].location.coordinates[0];
					const scan2 = {
							lat: coords2[0],
							lng: coords2[1]
					};
					dist += turf_methods.distance(scan1,scan2,'miles');
				}
				const meandist = {
						"meandist" : dist / validScans.length
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
				return reply('Missing parameters.').code(400);
			}
			
			//parse parameters
			var from = params.from;
			var to = params.to;
			
			//check if invalid dates
			if (from.length != 8 || to.length != 8 || (formatDate(to) < formatDate(from))) {
				return reply('Invalid date format').code(400);
			}
			
			//get all scans from database that fir into this time period
			db.collection('scans').find(function (err, docs) {
				
				//error searching database
				if (err) {
					return reply(err).code(500);
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
				
				const response = {
						numCrates: validScans.length,
						crates: validScans
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
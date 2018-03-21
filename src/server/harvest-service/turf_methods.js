/**
 * Methods implementing Turf API features. Can be imported in routes
 * to handle requests for turf things
 */

var turf = require('@turf/turf');



/*
 * Gets distance between 2 points
 * 
 * Parameters:
 * 	p1 (double) - js object with lat and lng properties
 *  p2 (double) - js object with lat and lng properties 
 *  unit (string) - unit of distance between points. Supported units are
 *  	degrees, radians, miles, km 
 *  
 *  Output (double): disance beween points
 *  
 */
exports.distance = function(p1, p2, unit) {
	
	var from = turf.point([p1.lat, p1.lng]);
	var to = turf.point([p2.lat, p2.lng]);
	
	var options = {units: unit};
	
	var dist = turf.distance(to, from, options);
	
	return dist;
	
};
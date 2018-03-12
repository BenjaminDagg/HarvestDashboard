/**
 * 
 */

/**
 * 
 */

const mongojs = require('mongojs');

exports.register = function(server, options, next) {
	
	const db = server.app.db;
	
	
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
		path: '/test',
		handler: function (request, reply) {
			reply('hello');
		}
	});
	
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-harvest'
};
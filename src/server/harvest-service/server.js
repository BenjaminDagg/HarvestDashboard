/**
 * 
 */

'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');

const port = 2000;

//create server object
const server = new Hapi.Server();
server.connection({
	port: port,
	host: 'localhost'
});


//connect to mongo database
server.app.db = mongojs(dbConfig.url, ['Maps']);

//load hapi plugins
server.register([require('./routes/harvest')], (err) => {
	if (err) {
		console.log(err);
		throw err;
	}
	
	//run server
	server.start((err) => {
		if (err) {
			console.log(err);
			throw err
		}
		
		console.log('Server started at ', server.info.uri);
	});
	
})


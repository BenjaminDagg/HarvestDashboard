/**
 *  Hapi server that implements a REST API to retrieve and send user info to
 *  a Mongo database.
 */

'use strict';

//dependancies
const Hapi = require('hapi');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');
var CookieAuth = require('hapi-auth-cookie');

const port = 4200;

//create server object
const server = new Hapi.Server();
server.connection({
	port: port,
	host: 'localhost'
});


//connect to mongo database
server.app.db = mongojs(dbConfig.url, ['user']);

var routes = [{register : require('./routes/user')}]

//load hapi plugins
server.register([
	{
		register: require('./routes/user')
	},
	{
		register: require('./auth/index')
	}
	
	], (err) => {
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

module.exports = server;


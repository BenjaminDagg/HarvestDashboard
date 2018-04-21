/**
 * 
 */

'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');

const port = 1234;

//create server object
const server = new Hapi.Server();
server.connection({
	port: port,
	host: 'localhost'
});

var io = require('socket.io')(server.listener);
io.on('connection', function(socket) {
	socket.emit('Welcome', {message: 'welcome'});
})

server.app.io = io;


//connect to mongo database
server.app.db = mongojs(dbConfig.url, ['Maps']);

//load hapi plugins
server.register([
		{
			register: require('./routes/maps')
		},
		{
			register: require('../plugins/auth/index')
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


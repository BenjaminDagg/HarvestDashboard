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

//array of all conneceted client sockets
var clients = [];

var io = require('socket.io')(server.listener);
io.on('connection', function(socket) {
	socket.emit('Welcome', {message: 'welcome'});
	
	//listens for sockets registering
	socket.on('register', function(socketInfo) {
		console.log(socket.id + ' connected');
		//create new client
		var client = {
			uid: socketInfo.uid,
			clientId: socket.id
		};
		
		
		clients.push(client);
		
	});
	
	//when client disconnects remove them from client array
	socket.on('disconnect', function(reason)  {
		console.log(socket.id + ' has disconnected');
		
		//remove socket form client array
		for (var i = 0; i < clients.length;i++) {
			if (clients[i].id == socket.id) {
				clients.splice(i,1);
			}
		}
	})
})

server.app.io = io;
server.app.clients = clients;

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


/**
 * 
 */

const mongojs = require('mongojs');

const crypto = require('crypto');
const secret = 'harvest_dashboard_secret_api_key';

const Joi = require('joi');

//schemas
var userSchema = require('../schemas/user/user-schema');
var errorSchema = require('../schemas/error/error-schema');




// Checks if object is empty
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}


function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

exports.register = function(server, options, next) {
	
	const db = server.app.db;
	
	
	/*
	 * Searches for all users with the currently signed in users' id
	 */
	server.route({
		config: {
			validate: {
				//query parameter structure
				query: {
					username: Joi.string().min(1),
					firstname: Joi.string().min(1),
					lastname: Joi.string().min(1)
				}
			},
			
			response: {
				status: {
					200: Joi.object().keys({
						users: Joi.array().items(userSchema)
					}),
					400: errorSchema,
					401: errorSchema
				}
			}
		},
		method: 'GET',
		path: '/users',
		
		handler: function (request, reply) {
			
			//get id from json web token passed in
			const currUid = request.auth.credentials;
			
			const objID = mongojs.ObjectId(currUid.id);
			//get optional query parameters form url if they exist
			const params = request.query;
			
			//filter by query parameters
			if (!isEmptyObject(params)) {
				params._id = objID;
				db.user.find(params, (err, docs) => {
					
					//error getting users or users not found
					if (err) {
						var response = {
								error: 'User(s) not found in database'
						};
						return reply(response).code(400);
					}
					
					
					
					//user found or return empty users
					//build array of user objects to return
					var users = new Array();
					for (var i = 0; i < docs.length;i++) {
						var newUser = {
								_id: docs[i]._id.toString(),
								username: docs[i].username,
								firstname: docs[i].firstname,
								lastname: docs[i].lastname,
								password: docs[i].password,
								createdAt: docs[i].createdAt
						};
						users[i] = newUser;
						
					}
					var response = {
							users: users
					};
					return reply(response).code(200);
					
				});
				
			}
			//no parameters given return the user object of uid
			else {
				console.log('in');
				db.user.find({_id: objID}, (err, docs) => {
					
					//error getting users or users not found
					if (err) {
						console.log(err);
						var response = {
								error: 'User(s) not found in database'
						};
						return reply(response).code(400);
					}
					console.log(docs);
					//user found or return empty users
					//build array of user objects to return
					var users = new Array();
					for (var i = 0; i < docs.length;i++) {
						console.log('id = ' + docs[i]._id)
						var newUser = {
								_id: docs[i]._id.toString(),
								username: docs[i].username,
								firstname: docs[i].firstname,
								lastname: docs[i].lastname,
								password: docs[i].password,
								createdAt: docs[i].createdAt
						};
						users[i] = newUser;
						
					}
					var response = {
							users: users
					};
					return reply(response).code(200);
					
				});
			}
			
			
			
		}
	});
	
	
	/*
	 * Returns user info in JSON sring given the users id
	 * 
	 * Request:
	 * 		HTTP GET message
	 * 		Body:
	 * 			"id" : string
	 * 
	 * Response
	 * 		Return 200 OK if user found in database
	 * 
	 * 		Returns 400 Bad Request if user not found
	 * 
	 * 		Returns 
	 */
	server.route({
		method: 'GET',
		path: '/users/{id}',
		handler: function (request, reply) {
			
			//create ObjectId to index into database
			const id = request.params.id;
		
			
			//id must be a 24 digit hex number
			//check for valid ID before creating ObjecctId object
			//if id not correct lenght then will throw error and crash
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						users: null
				};
				return reply(result).code(400);
			}
			
			const objID = mongojs.ObjectId(id);
				
			//query databsase passing in objId
			db.user.findOne({ _id: objID}, (err, doc) => {
					
				//error occured
				if (err) {
					const result = {
							error: err,
							user: null
					};
					return reply(result).code(200);
				}
				
				
				//user not found in databse
				else if (!doc) {
					const result = {
							error: 'user not found',
							user: null
					};
					return reply(result).code(400);
				}
				//user found
				else {
					
					//remove users password befor sending response
					delete doc.password;
					
					var result = {
							user: doc
					}
					return reply(result).code(200);
				}
			});
			
			
		}
	});
	
	
	/*
	 * Takes user object passed in from body and 
	   if valid appends user to user collection of database
	 * 
	 * Request:
	 * 		HTTP POST message
	 * 		Body:
	 * 			username: string
	 * 			password: string
	 * 			firstname: string
	 * 			lastname: string
	 * 
	 * Response:
	 * 		Returns 200 OK if user successfully registered
	 * 		400 - Bad Request. Fields missing in body or username already exists
	 * 		500 - error in database lookup
	 * 		
	 * 		
	 */
	server.route({
		config: {
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			},
			auth: false
		},
		method: 'POST',
		path: '/users/register',
		handler: function (request, reply) {
			
			//get user info from request body
			var user = request.payload;
			
			//no body given in request. Return 400 Bad Request
			if (!user) {
				return reply({error: 'Bad Request. Missing request body'}).code(400);
			}
			
			//check if HTTP body is valid
			if (!('username' in user) ||
				!('password' in user) ||
				!('firstname' in user) ||
				!('lastname' in user)) {
				
				const response = {
						error: 'Fields missing. Must include username, password,firstname and lastname in body'
				};
				return reply(response).code(400);
			}
			
			//save date the user registered
			//format: YYYY-MM-DD
			var date = new Date();
			var day = date.getDate();
			day = (day < 10 ? "0" : "") + day;
			var month = date.getMonth();
			month = (month < 10 ? "0" : "") + month;
			var year = date.getFullYear();
			var hour = date.getHours();
		    hour = (hour < 10 ? "0" : "") + hour;
		    var min  = date.getMinutes();
		    min = (min < 10 ? "0" : "") + min;
		    var sec  = date.getSeconds();
		    sec = (sec < 10 ? "0" : "") + sec;
		    var dateStr = year + "-" + month + "-" + day ;
		    
		    user.createdAt = dateStr;
		    
		    var password = user.password;
		    const hash = crypto.createHmac('sha256', secret).update(password).digest('base64');
		    user.password = hash;
			
			//check if user already exists in database
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					const response = {
							error: err
					};
					return reply(response).code(500);
				}
				//username found in databse
				if (doc) {
					const response = {
							error: 'username is in use'
					};
					return reply(response).code(400);
				}
				//user does not exist so add them
				else {
					//insert user into user collection
					db.user.save(user, (err, resul) => {
						if (err) {
							const response = {
									error: err
							};
							reply(response).code(500);
						}
						else {
							const response = {
									messege: user.username + ' was registered',
									user: user
							}
							reply(response).code(200);
						}
							
					});
				}
				
			});
			
			
			
		}
	});
	
	
	/*
	 * Takes passed in user info from HTTP body and checks if user is in databae
	 * 
	 * Request:
	 * 		HTTP POST
	 * 		Body:
	 * 			username: string
	 * 			password: string
	 * Response:
	 * 		If error occured response will contain 400 Bad Request header. Body
	 * 		will have an error message that explains what went wrong.
	 * 
	 * 		If no error resonse will have 200 OK header. Body will have messege
	 * 		that says 'login success' and a user object of the logged in user
	 */
	server.route({
		config: {
			auth: false,
			cors: {
				origin: ['*'],
				additionalHeaders: ['cache-control', 'x-requested-with']
			}
		},
		method: 'POST',
		path: '/users/login',
		handler: function (request, reply) {
			
			var user = request.payload;
			var error = {
					error: ''
			};
			
			//no body given in request. Return Bad Request 400
			if (!user) {
				error.error = 'Invalid request. No body given';
				return reply(error).code(400);
			}
			
			//login credentials not provided
			if (!('username' in user) ||
					!('password' in user) ) {
				const response = {
						error: 'Error: Must provide username and password in request body.'
				};
				return reply(response).code(400);
			}
			
			 var password = user.password;
			 const hash = crypto.createHmac('sha256', secret).update(password).digest('base64');
			 user.password = hash;
			
			
			//search database for user and check if credentials correct
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					console.log(err);
					error.error = 'Incorrect login credentials';
					reply(error).code(400);
				}
				else if (!doc) {
					error.error = 'User not found';
					reply(error).code(400);
				}
				else {
					if (doc.password != user.password) {
						error.error = 'Incorrect login credentials';
						reply(error).code(400);
					}
					else if (doc.password === user.password) {
						const response = {
								messege: 'Login success',
								data: {
									user: doc
								}
						}
						
						reply(response).code(200);
					}
				}
			})
			
			
			
		}
	});
	
	return next();
	
};

exports.register.attributes = {
		name: 'routes-user'
};
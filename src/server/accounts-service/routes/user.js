/**
 * 
 */

const mongojs = require('mongojs');






// This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

// This should work both there and elsewhere.
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
	 * Returns list of users from database
	 * 
	 * Default (no query parameters) : returns every user in database
	 * 
	 * Optional Parameters:
	 * 		&username=usernameOfUser
	 * 		&firstname=firstnameOfUser
	 * 		&lastname=lastnameOfUser
	 * 		&limit=aNumber 		<-- only retrieves this many users on query
	 * 
	 * 		can use multiple optional parameters at once
	 * 
	 * Request:
	 * 		HTTP GET message
	 * 		nothing in the body
	 * 		can have optional parameters in request URL
	 * 
	 * Response:
	 * 		Returns 200 OK HTTP header regardless of outcome
	 * 
	 * 		If error occured then an error element will be in the repsonse
	 * 		JSON in the body. A status code element will be in the response body
	 * 		telling the result.
	 * 
	 * 		If no users found returns an empty users array
	 * 
	 *  	If no errors the response JSON will be a list of users
	 */
	server.route({
		method: 'GET',
		path: '/users',
		handler: function (request, reply) {
			
			//get optional query parameters form url if they exist
			const params = request.query;
			
			//params array not empty so add query paramaters to db lookup
			if (!isEmptyObject(params)) {
				if ('limit' in params) {
					
					const limit = Number(params.limit);
					delete params.limit;
					db.user.find(params).limit(limit,  (err, docs) => {
						if (err) {
							
							response = {
								error: 'Error retrieving user(s) from database'
							};
							return reply(response).code(200);
						}
						
						response = {
								users: docs
						};
						return reply(response).code(200);
					})
				}
				else {
					db.user.find(params, (err, docs) => {
						if (err) {
							
							response = {
								error: 'Error retrieving user(s) from database'
							};
							reply(response).code(200);
						}
						response = {
								users: docs
						};
						reply(response).code(200);
					})
				}
			}
			//query parameters empty so get all users
			else {
				db.user.find((err, docs) => {
					if (err) {
						response = {
							error: 'Error retrieving user(s) from database'
						};
						reply(response).code(200);
					}
					
					
					
					response = {
							users: docs
					};
					reply(response).code(200);
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
	 * 		Return 200 OK regardless of outcome
	 * 
	 * 		If user found and no error return user object in HTTP body
	 * 		
	 * 		If error returns error message in HTTP body
	 */
	server.route({
		method: 'GET',
		path: '/users/{id}',
		handler: function (request, reply) {
			
			//create ObjectId to index into database
			const id = request.params.id;
			
			console.log('id length = ' + id.length);
			
			//id must be a 24 digit hex number
			//check for valid ID before creating ObjecctId object
			//if id not correct lenght then will throw error and crash
			if (id.length != 24) {
				const result = {
						error: 'Invalid ID format. User ID must be 24 characters',
						users: null
				};
				return reply(result).code(200);
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
					return reply(result).code(200);
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
	 * 		Returns 200 OK
	 * 		
	 * 		
	 */
	server.route({
		method: 'POST',
		path: '/users/register',
		handler: function (request, reply) {
			
			//get user info from request body
			const user = request.payload;
			
			//check if HTTP body is valid
			if (!('username' in user) ||
				!('password' in user) ||
				!('firstname' in user) ||
				!('lastname' in user)) {
				
				const response = {
						error: 'Fields missing. Must include username, password,firstname and lastname in body'
				};
				return reply(response).code(200);
			}
			
			//save date the user registered
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
		    var dateStr = year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
		    user.createdAt = dateStr;
			
			//check if user already exists in database
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					const response = {
							error: err
					};
					return reply(response).code(200);
				}
				//username found in databse
				if (doc) {
					const response = {
							error: 'username is in use'
					};
					return reply(response).code(200);
				}
				//user does not exist so add them
				else {
					//insert user into user collection
					db.user.save(user, (err, resul) => {
						if (err) {
							const response = {
									error: err
							};
							reply(response).code(200);
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
			
			//login credentials not provided
			if (!('username' in user) ||
					!('password' in user) ) {
				const response = {
						error: 'Error: Must provide username and password in request body.'
				};
				return reply(response).code(400);
			}
			
			//search database for user and check if credentials correct
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					console.log(err);
					error.error = 'Error. User not found';
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
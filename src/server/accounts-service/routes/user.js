/**
 * 
 */
var moment = require('moment');

const mongojs = require('mongojs');

const crypto = require('crypto');
const secret = 'harvest_dashboard_secret_api_key';

const Joi = require('joi');

//schemas
var userSchema = require('../schemas/user/user-schema');
var errorSchema = require('../schemas/error/error-schema');

//utc offset for Pacific Standard Time (8 hours behind)
const utcOffsetPST = "-8:00"


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
	
	 Request: 
	 	GET
	 	Required headers: 
			Authorization: Bearer + [your token]
	 	Body: none
	 	Query parameters:
	 		username: username of searched for user
	 		firstname: firsname of searched for user
	 		lastname: lastname of searched for user
	 Response:
	 	status 200:
	 	Body (object):
	 	{
	 		users (array[object]) [
				{
	 				_id (string),
	 				username (string),
	 				firstname (string),
	 				lastname (string),
	 				createdAt: (date ISO)
				}
	 		]
	 	}
	 
	 	status 400:
	 	Body (object):
		{
			statusCode (string),
	 		error (string),
	 		messsage (string)
	 	}

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
		config: {
			validate: {
				params: {
					id: Joi.string().length(24)
				},
				query: {
					
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						user: userSchema
					}),
					400: errorSchema
				}
			}
		},
		handler: function (request, reply) {
			
			//create ObjectId to index into database
			const id = request.params.id;
			
			//make id objecct for mongo query
			const objID = mongojs.ObjectId(id);
				
			//query databsase passing in objId
			db.user.findOne({ _id: objID}, (err, doc) => {
					
				//error occured
				if (err) {
					const result = {
							statusCode: 400,
							error: 'User query failed',
							message: 'User not found'
					};
					return reply(result).code(400);
				}
				
				
				//user not found in databse
				else if (!doc) {
					const result = {
							statusCode: 400,
							error: 'User query failed',
							message: 'User not found'
					};
					return reply(result).code(400);
				}
				//user found
				else {
					
					var user = {
							_id: doc._id.toString(),
							username: doc.username,
							firstname: doc.firstname,
							lastname: doc.lastname,
							createdAt: doc.createdAt
					};
					
					var result = {
							user: user
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
			auth: false,
			validate: {
				params: {
					//none
				},
				query: {
					//none
				},
				payload: {
					username: Joi.string().required(),
					password: Joi.string().required(),
					firstname: Joi.string().required(),
					lastname: Joi.string().required()
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						message: Joi.string(),
						user: userSchema
					}),
					400: errorSchema,
					500: errorSchema,
				}
			}
		},
		method: 'POST',
		path: '/users/register',
		handler: function (request, reply) {
			
			//get user info from request body
			var user = request.payload;
			
			//no body given in request. Return 400 Bad Request
			if (!user) {
				
				const response = {
						statusCode: 400,
						error: 'Bad Reqeust',
						message: 'No request payload'
				};
				return reply(response).code(400);
			}
			
			//creates date in ISO format and assigns it to user createdAt
			var date = moment().utc(utcOffsetPST).toISOString();
		    user.createdAt = date;
		    console.log('date = ' + date);
		    
		    //encrypt user password before putting in database
		    var password = user.password;
		    const hash = crypto.createHmac('sha256', secret).update(password).digest('base64');
		    user.password = hash;
			
			//check if user already exists in database
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					
					const response = {
							statusCode: 500,
							error: 'Server error',
							message: 'Error looking up user in database'
					};
					return reply(response).code(500);
				}
				//username found in databse
				if (doc) {
					
					const response = {
							statusCode: 400,
							error: 'Error registering user',
							message: 'Username is in use'
					};
					return reply(response).code(400);
				}
				//user does not exist so add them
				else {
					
					//insert user into user collection
					db.user.save(user, (err, result) => {
						if (err) {
							console.log('error saving');
							const response = {
									statusCode: 500,
									error: 'Server error',
									message: 'Error looking up user in database'
							};
							reply(response).code(500);
						}
						else {
							console.log('success');
							var resUser = {
									_id: result._id.toString(),
									username: result.username,
									password: result.password,
									firstname: result.firstname,
									lastname: result.lastname,
									createdAt: result.createdAt
							};
							
							const response = {
									message: user.username + ' was registered',
									user: resUser
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
			},
			validate: {
				params: {
					//none
				},
				query: {
					//none
				},
				payload: {
					username: Joi.string().required(),
					password: Joi.string().required()
				}
			},
			response: {
				status: {
					200: Joi.object().keys({
						message: Joi.string(),
						data: Joi.object().keys({
							user: userSchema
						})
					}),
					400: errorSchema,
					500: errorSchema,
				}
			}
		},
		method: 'POST',
		path: '/users/login',
		handler: function (request, reply) {
			
			var user = request.payload;
			var response;
			
			//no body given in request. Return Bad Request 400
			if (!user) {
				response = {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Missing required properties username and password in body',
				};
				return reply(response).code(400);
			}
			
			
			//encrypt passed in password to compate to encrypted password stored in database
			 var password = user.password;
			 const hash = crypto.createHmac('sha256', secret).update(password).digest('base64');
			 user.password = hash;
			 
			 
			
			//search database for user and check if credentials correct
			db.user.findOne({ username: user.username}, (err, doc) => {
				
				//error occured
				if (err) {
					response = {
							statusCode: 400,
							error: 'Bad Request',
							message: 'Incorrect login credentials',
					};
					reply(response).code(400);
				}
				//no users found with given username
				else if (!doc) {
					response = {
							statusCode: 400,
							error: 'Bad Request',
							message: 'No users found with this username',
					};
					reply(response).code(400);
				}
				else {
					//user found but wrong password
					if (doc.password != user.password) {
						response = {
								statusCode: 400,
								error: 'Bad Request',
								message: 'Incorrect login credentials',
						};
						reply(response).code(400);
					}
					//user found and credentials match
					else if (doc.password === user.password) {
						
						//copy doc into new object
						var resUser = {
								_id: doc._id.toString(),
								username: doc.username,
								password: doc.password,
								firstname: doc.firstname,
								lastname: doc.lastname,
								createdAt: doc.createdAt
						};
						const response = {
								message: 'Login success',
								data: {
									user: resUser
								}
						};
						
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
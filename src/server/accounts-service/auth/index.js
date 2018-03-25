/**
 * 
 */

const Hapi = require('hapi');
const config = require('./config/index');
var jwt = require('jsonwebtoken');
const mongojs = require('mongojs');


exports.register = function(server, options, next){
	
	const db = server.app.db;

    server.register([
        {
        	register: require('hapi-auth-basic')
        },
        {
        	register: require('hapi-auth-jwt2')
        }
    ], function(err) {
        if (err) {
            console.error('Failed to load a plugin:', err);
            throw err;
        }
        
        
        
        const basicValidate = async (request, username, password, reply) => {
        	
        	
        	
        	db.collection('user').findOne({ username: username}, (err, doc) => {
        		
        		//error occured
        		if (err) {
        			console.log('err in database lookup');
        			return reply({
						isValid: false,
						errors: [{
							message: "Unable to verify your credentials"
						}]
        			}).code(403);
        		}
        		else if (!doc) {
        			console.log('doc not found');
        			return reply({
						isValid: false,
						errors: [{
							message: "Unable to verify your credentials"
        			}]
        			}).code(403);        		}
        		else {
        			if (doc.password != password) {
        				console.log('incorrect login');
        				return reply({
        						isValid: false,
        						errors: [{
        							message: "Unable to verify your credentials"
        						}]
        				}).code(403);
        			}
        			else if (doc.password === password) {
        				console.log('correct login');
        				const token = getToken(doc._id);
        				return reply({ isValid: true, credentials: {
        					token_type: "bearer",
        					"access_token": token
        				} }).header("Authorization", token);
        			}
        		}
        	})
        	
        }
        
        const jwtValidate = async (decoded, request, h) => {
        	
        	const objID = mongojs.ObjectId(decoded.id);
        	
        	db.collection('user').findOne({_id: objID}, (err, doc) => {
        		if (err) {
        			return h(null, false);
        		}
        		else if (!doc) {
        			return h(null, false)
        		}
        		else {
        			console.log('isvalid');
        			return h(null, true);
        		}
        	})
        }
        
       //AAAAAAAAAAAAAAAAAAAAABi84QAAAAAAFjkGe770Y4aEShywve5lZpj1zT8%3D0GktqMpavqj4mzoomxQgb4xQrR8WRTwAtn6VB5cvS7dFcmhrnH
        
        function createGUID() {
        	return new Date().getTime();
        }
        
        function getToken(id) {
        	
        	const secret = config.secret;
        	console.log(secret);
        	
        	return jwt.sign({
        		id: id
        	}, secret, {expiresIn: 60 * 60});
        }
        
        
        function verify(token) {
        	var decoded = false;
        	
        	try {
        		decoded = jwt.verify(token, config.seret);
        	} catch (e) {
        		decoded = false;
        	}
        	
        	return decoded;
        }

        // Set our server authentication strategy
        server.auth.strategy('simple', 'basic', {
        	validateFunc: basicValidate
        });
        
        server.auth.strategy('jwt', 'jwt', { 
        			key: config.secret,         
        		    validateFunc: jwtValidate,            
        		    verifyOptions: { algorithms: [ 'HS256' ] } ,
        		    appendNext: true
        });
        
        
        server.auth.default('jwt');
        
        
        server.route({
    		config: {
    			auth: 'simple',
    			cors: {
    				origin: ['*'],
    				additionalHeaders: ['cache-control', 'x-requested-with']
    			}
    		},
    		method: 'POST',
    		path: '/authenticate',
    		handler: function (request, reply) {
    			
    			
    		}
    	});
        
        server.route({
    		config: {
    			cors: {
    				origin: ['*'],
    				additionalHeaders: ['cache-control', 'x-requested-with']
    			}
    		},
    		method: 'GET',
    		path: '/restricted',
    		handler: function (request, reply) {
    			
    			return reply('hello');
    			
    		}
    	});
        
        
        
        
        next();
        
        

    });
    
    
    
}
    
exports.register.attributes = {
		name: 'auth'
};


exports.validateUser = function validateUser(server, username, password, callback) {
	const db = server.app.db;
	
	if (username.length == 0 || password.length == 0) {
		return error(null);
	}
	
	db.collection('user').findOne({ username: username}, (err, doc) => {
		
		//error occured
		if (err) {
			console.log('err in database lookup');
			callback(null, new Error('Error in database lookup'));
		}
		else if (!doc) {
			console.log('doc not found');
			callback(null, new Error('Unauthorized: User not found in database'));
		}
		else {
			if (doc.password != password) {
				console.log('incorrect login');
				callback(null, new Error('Unauthorized: Incorrect username of password'));
			}
			else if (doc.password === password) {
				console.log('correct login');
				callback(doc, null);
			}
		}
	})
}
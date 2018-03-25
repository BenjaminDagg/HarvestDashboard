/**
 * 
 */

const Hapi = require('hapi');
const config = require('./config/index');
var jwt = require('jsonwebtoken');
const mongojs = require('mongojs');


exports.register = function(server, options, next){
	
	const db = server.app.db;

	//register hapi authentication libraries
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
        
        
        /*
         * Validates key given in Basic authentication
         * 
         * Parameters:
         * 		Request: Original API request route that prompted the authentication
         * 		Reply: Response to the original API request
         * 		Username: username decoded from HTTP Authorizaion header
         * 		Password: password decoded from HTTP Authorization header
         * 
         * Output:
         * 		HTTP respons message
         * 		403 - Invalid username or password given
         * 		200 - Valid username and password. User was authentication
         * 		A bearer token is sent in the response body whoch you use for future
         * 		api calls
         */
        const basicValidate = async (request, username, password, reply) => {
        	
        	
        	//check if the username given in the token is in the database
        	db.collection('user').findOne({ username: username}, (err, doc) => {
        		
        		//error occured. Reply with forbiden
        		if (err) {
   
        			return reply({
						isValid: false,
						errors: [{
							message: "Unable to verify your credentials"
						}]
        			}).code(403);
        		}
        		//username doesnte exist in database
        		//reply with forbided
        		else if (!doc) {
        			
        			return neply({
						isValid: false,
						errors: [{
							message: "Unable to verify your credentials"
        			}]
        			}).code(403);        		
        		}
        		//user found. Now check if correct password
        		else {
        			//incorrect password
        			//given HTTP basic token is incorrect
        			if (doc.password != password) {
        				
        				return reply({
        						isValid: false,
        						errors: [{
        							message: "Unable to verify your credentials"
        						}]
        				}).code(403);
        			}
        			//valid username and password
        			//create a bearer token with json web token
        			//and send it back in repsonse body
        			else if (doc.password === password) {
        				
        				const token = getToken(doc._id);
        				return reply({ isValid: true, credentials: {
        					token_type: "bearer",
        					"access_token": token
        				} }).header("Authorization", token);
        			}
        		}
        	})
        	
        }
        
        
        /*
         * Validation method for json web token authorization
         * 
         * Takes a json web token passed in from HTTP header of request and
         * parses the user id from it. Checks if userid is in the the database
         * 
         * Response:
         * 		401 - Unauthorized. You tried to access the api without getting authorized
         * 		from the /authorize route
         * 
         * 		200 - You provided a valid bearer token and can access the api resource
         */
        const jwtValidate = async (decoded, request, h) => {
        	
        	const objID = mongojs.ObjectId(decoded.id);
        	
        	//check if the id parsed from the bearer token is in the database
        	db.collection('user').findOne({_id: objID}, (err, doc) => {
        		if (err) {
        			return h(null, false);
        		}
        		else if (!doc) {
        			return h(null, false)
        		}
        		else {
        			
        			return h(null, true);
        		}
        	})
        }
        
      
        /*
         * Created a json web token to be send to a user for authroization
         * 
         * Parameters:
         * 		id (string): the user id of a user from the database
         * 
         * Output:
         * 		A json web token object with an 'id' field
         */
        function getToken(id) {
        	
        	const secret = config.secret;
        	

        	return jwt.sign({
        		id: id
        	}, secret, {expiresIn: 60 * 60});
        }
        
        
       

        /*
         * Created a Hapi authentication scheme to implement
         * HTTP Basic authentication
         */
        server.auth.strategy('simple', 'basic', {
        	validateFunc: basicValidate
        });
        
        /*
         * Creates Hapi authentication scheme to implement
         * HTTP Bearer authentiation
         * 
         * uses SHAH-256 encrytion to encrypt a given string
         * with our secret key found in config
         */
        server.auth.strategy('jwt', 'jwt', { 
        			key: config.secret,         
        		    validateFunc: jwtValidate,            
        		    verifyOptions: { algorithms: [ 'HS256' ] } ,
        		    appendNext: true
        });
        
        
        /*
         * Requires HTTP Bearer authentication for all routes
         * in the database
         */
        server.auth.default('jwt');
        
        
        /*
         * Authenticates user with bearer token to give them
         * access to the database. You cannot access other routes
         * of database without calling /auhtorize first to get a token
         * 
         * Client sends HTTP request with a 'Authorization' header.
         * To make authorization header:
         * 		token = password + ':' + username
         * 		base64 encode token
         * 		token = 'Basic ' + token
         * 		put token in authorizatio header
         * If the token is valid then the response will provide a bearer token
         * put this token in an 'Authorization : bearer' header to access all other
         * routes of api
         * 
         * Request:
         * 		POST
         * 		Header: 'Authorization'
         * 				put token in authorization field
         * 		no body
         * 
         * Response:
         * 		403 - Invalid authroization token given.
         * 		either you malformed it or gave incorrect username or password
         * 		200 - Username and password valid. A bearer token is given in body.
         * 		Use ths token to access database
         * 		
         * 		
         */
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
        

        next();
        
        

    });
    
    
    
}


    
exports.register.attributes = {
		name: 'auth'
};



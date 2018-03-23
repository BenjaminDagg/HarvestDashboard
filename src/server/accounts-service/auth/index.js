/**
 * 
 */

exports.register = function(server, options, next){
	
	const db = server.app.db;

    server.register([
        {
            register: require('hapi-auth-cookie')
        }
    ], function(err) {
        if (err) {
            console.error('Failed to load a plugin:', err);
            throw err;
        }

        // Set our server authentication strategy
        server.auth.strategy('standard', 'cookie', {
            password: 'somecrazycookiesecretthatcantbeguesseswouldgohere', // cookie secret
            cookie: 'harvest-dashboard', // Cookie name
            isSecure: false, // required for non-https applications
            ttl: 24 * 60 * 60 * 1000 // Set session to 1 day
        });
        
        server.auth.default({
        	strategy: 'standard'
        })

    });
    
    
    
    
    next();
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
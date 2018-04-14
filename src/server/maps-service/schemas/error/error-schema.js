

/**
 * Defines error schema for when any error occurs in a request
 */

const Joi = require('joi');


module.exports = Joi.object({
	statusCode: Joi.number(),
	error: Joi.string(),
	message: Joi.string()
	
})


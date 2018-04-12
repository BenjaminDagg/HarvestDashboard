/**
 * Defines user schema for Joi to formaat input and output of routes
 */

const Joi = require('joi');



module.exports = Joi.object({
	_id: Joi.string(),
	username: Joi.string(),
	firstname: Joi.string(),
	lastname: Joi.string(),
	password: Joi.string(),
	createdAt: Joi.string()
})


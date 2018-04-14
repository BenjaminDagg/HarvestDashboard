/**
 * Defines map schema for Joi to formaat input and output of routes
 */

const Joi = require('joi');



module.exports = Joi.object({
	_id: Joi.string(),
	type: Joi.string(),
	name: Joi.string(),
	createdAt: Joi.date().iso(),
	expiration: Joi.date().iso(),
	shape: Joi.object(),
	data: Joi.object()
})


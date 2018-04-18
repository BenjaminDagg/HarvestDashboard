/**
 * Defines scan schema for Joi to formaat input and output of routes
 */

const Joi = require('joi');



module.exports = Joi.object({
	_id: Joi.string().length(24).required(),
	profileId: Joi.string().length(24).required(),
	datetime: Joi.date().iso().required(),
	mapIds: Joi.array().items(Joi.string().length(24)),
	scannedValue: Joi.string().required(),
	location: Joi.object().keys({
		type: Joi.string().required(),
		coordinates: Joi.array().required()
	}).required(),
	data: Joi.object()
})


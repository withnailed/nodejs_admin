const CustomError = require('../lib/Error');
const express = require('express');
const Enum = require('../config/Enum');
const router = express.Router();
const Response = require('../lib/Response');
const Roles = require('../db/models/Roles');

router.get('/', async (req, res, next) => {
    try {
        let roles = await Roles.find();
        res.json(Response.successResponse(roles));

        res.json({ success: true });

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/add', async (req, res) => {
    try {
        let body = req.body;
        if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Role is required");
        let roles = new Roles(req.body);
        await roles.save();
        res.json(Response.successResponse({ success: true }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/update', async (req, res) => {
    try {
        let body = req.body;
        let updates = {};
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
        await Roles.updateOne({ _id: body.id }, updates);
        res.json(Response.successResponse({ success: true }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.delete('/delete', async (req, res) => {
    try {
        let body = req.body;
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        await Roles.remove({ _id: body.id });
        res.json(Response.successResponse({ success: true }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
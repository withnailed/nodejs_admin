var express = require('express');
var router = express.Router();
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const RolePrivileges = require('../db/models/RolePrivileges');


router.get('/', async (req, res, next) => {

    try {
        let rolePrivileges = await RolePrivileges.find({});
        res.json(Response.successResponse(rolePrivileges));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/add', async (req, res) => {
    let body = req.body;
    try {

        if (!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Name is required");
        let rolePrivileges = new RolePrivileges({
            name: body.name,
            created_by: req.user._id,
            is_active: true
        });

        await rolePrivileges.save();

        res.json(Response.successResponse({ success: true }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(Response.errorResponse(error));
    }

})

router.post('/update', async (req, res) => {
    let body = req.body;
    try {
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        let updates = {};
        if (body.name) updates.name = body.name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
        await RolePrivileges.updateOne({ _id: body.id }, updates);
        res.json(Response.successResponse({ success: true }));
    }
    catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(Response.errorResponse(error));
    }
});

router.post('/delete', async (req, res) => {
    let body = req.body;
    try {
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        await RolePrivileges.remove({ _id: body.id });
        res.json(Response.successResponse({ success: true }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(Response.errorResponse(error));
    }
});

module.exports = router;


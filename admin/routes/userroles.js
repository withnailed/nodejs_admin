const CustomError = require('../lib/Error');
const express = require('express');
const router = express.Router();
const Response = require('../lib/Response');
const UserRoles = require('../db/models/UserRoles');
const mongoose = require('mongoose');


const Enum = require('../config/Enum');

router.get('/', async (req, res, next) => {
    try {
        let userRoles = await UserRoles.find();
        res.json(Response.successResponse(userRoles));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post('/add', async (req, res) => {
    try {
        const { role_id, user_id } = req.body;

        // Zorunlu alan kontrolü
        if (!role_id || !user_id) {
            return res.status(400).json({
                code: 400,
                message: 'validation error',
                data: {
                    errors: {
                        role_id: role_id ? undefined : 'required',
                        user_id: user_id ? undefined : 'required'
                    }
                }
            });
        }

        // ObjectId validasyonu
        if (!mongoose.isValidObjectId(role_id) || !mongoose.isValidObjectId(user_id)) {
            return res.status(400).json({
                code: 400,
                message: 'validation error',
                data: { details: 'role_id ve user_id geçerli bir ObjectId olmalı' }
            });
        }

        // Aynı (user_id, role_id) çifti zaten var mı?
        const exists = await UserRoles.findOne({ role_id, user_id });
        if (exists) {
            return res.status(409).json({
                code: 409,
                message: 'duplicate',
                data: { exists: true }
            });
        }

        const created = await UserRoles.create({ role_id, user_id });

        return res.status(200).json({
            code: 200,
            message: 'Success',
            data: created
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'server error' });
    }
});


router.post('/update', async (req, res) => {
    try {
        const { id, role_id, user_id } = req.body;
        if (!id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");

        const updates = {};
        if (role_id) updates.role_id = role_id;
        if (user_id) updates.user_id = user_id;

        const result = await UserRoles.findByIdAndUpdate(id, updates, { new: true });
        if (!result) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "not found", "Role not found");

        res.json(Response.successResponse(result));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.delete('/delete', async (req, res) => {
    try {
        let body = req.body;
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        const del = await UserRoles.deleteOne({ _id: body.id });
        if (del.deletedCount === 0) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "not found", "Role not found");
        }
        res.json(Response.successResponse({ success: true }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
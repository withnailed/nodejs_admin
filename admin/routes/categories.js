const CustomError = require('../lib/Error');
var express = require('express');
var router = express.Router();
const Response = require('../lib/Response');
const mongoose = require('mongoose');

const Enum = require('../config/Enum');
const Categories = require('../db/models/Categories'); // Assuming Categories model is defined in this path


/* GET categories listing. */
router.get('/', async (req, res, next) => {

    try {
        let categories = await Categories.find({});
        res.json(Response.successResponse(categories));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/add', async (req, res) => {
    try {
        const { name, is_active, created_by } = req.body;

        if (!name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'validation error', 'Name is required');

        // created_by: öncelik auth'dan, yoksa body'den al
        let creatorId = req.user && req.user._id ? req.user._id : created_by;
        if (!creatorId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'validation error', 'created_by is required (or provide authenticated user)');
        }
        if (!mongoose.isValidObjectId(creatorId)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'validation error', 'created_by must be a valid ObjectId');
        }

        const category = await Categories.create({
            name,
            created_by: creatorId,
            is_active: typeof is_active === 'boolean' ? is_active : true
        });

        res.json(Response.successResponse(category));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/update', async (req, res) => {
    try {
        const { id, name, is_active } = req.body;
        if (!id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'validation error', 'ID is required');

        const updates = {};
        if (name) updates.name = name;
        if (typeof is_active === 'boolean') updates.is_active = is_active;

        const updated = await Categories.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, 'not found', 'Category not found');

        res.json(Response.successResponse(updated));
    } catch (error) {
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/delete', async (req, res) => {
    let body = req.body;
    try {
        if (!body.id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
        const del = await Categories.deleteOne({ _id: body.id });
        if (del.deletedCount === 0) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, 'not found', 'Category not found');
        }
        res.json(Response.successResponse({ success: true }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});
module.exports = router;

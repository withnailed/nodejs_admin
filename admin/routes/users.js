var express = require('express');
const Enum = require('../config/Enum');
var router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Users = require('../db/models/Users'); // Assuming Users model is defined in this path
const is = require('is_js');
const Roles = require('../db/models/Roles');
const UserRoles = require('../db/models/UserRoles');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let users = await Users.find({});
    res.json(Response.successResponse(users));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }

});


router.post('/add', async (req, res) => {
  let body = req.body;
  try {
    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Email is required");
    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Password is required");

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", `Password must be at least ${Enum.PASS_LENGTH} characters long`);
    }
    if (!is.email(body.email)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Email is not valid");
    }

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "At least one role is required");
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });
    if (roles.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Role is not valid");

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    let createdUser = await Users.create({
      email: body.email,
      password: password,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      is_active: true
    });
    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        user_id: createdUser._id,
        role_id: roles[i]._id
      });
    }
    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/update', async (req, res) => {
  let body = req.body;
  try {
    let updates = {};
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
    if (body.password && body.password.length < Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }
    if (body.first_name) {
      updates.first_name = body.first_name;
    }
    if (body.last_name) {
      updates.last_name = body.last_name;
    }
    if (body.phone_number) {
      updates.phone_number = body.phone_number;
    }

    if (Array.isArray(body.roles) && body.roles.length > 0) {

      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id.toString()) } });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
          });

          await userRole.save();
        }
      }

    }


    let role = await Roles.findOne({ _id: { $in: body.roles } });
    if (role.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Role is not valid");



    await Users.updateOne({ _id: body._id }, { $set: updates });
    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/delete', async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "ID is required");
    await Users.deleteOne({ _id: body._id });
    await UserRoles.deleteMany({ user_id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/register', async (req, res) => {
  let body = req.body;
  try {
    let user = await Users.findOne({});
    if (user) {
      res.sendStatus(Enum.HTTP_CODES.NOT_FOUND)
      return;
    }

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Email is required");
    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Password is required");

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", `Password must be at least ${Enum.PASS_LENGTH} characters long`);
    }
    if (!is.email(body.email)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error", "Email is not valid");
    }



    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    let createdUser = await Users.create({
      email: body.email,
      password: password,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
      is_active: true
    });
    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    });
    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });
    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;

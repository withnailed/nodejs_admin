const e = require('express');
const mongoose = require('mongoose');
const { use } = require('react');
const schema = mongoose.Schema({
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

class RolePrivileges extends mongoose.Model {

}
schema.loadClass(RolePrivileges);
module.exports = mongoose.model('role_privileges', schema);
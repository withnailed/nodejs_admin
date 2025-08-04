const e = require('express');
const mongoose = require('mongoose');
const schema = mongoose.Schema({
    permission: { type: String, required: true },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created_by: {
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
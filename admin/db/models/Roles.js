const e = require('express');
const mongoose = require('mongoose');
const schema = mongoose.Schema({
    role_name: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }



}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

class Roles extends mongoose.Model {
    static async findByEmail(email) {
        return this.findOne({ email: email });
    }

    static async createUser(userData) {
        const user = new this(userData);
        return user.save();
    }

    static async updateUser(id, userData) {
        return this.findByIdAndUpdate(id, userData, { new: true });
    }

    static async deleteUser(id) {
        return this.findByIdAndDelete(id);
    }
}
schema.loadClass(Roles);
module.exports = mongoose.model('Roles', schema);
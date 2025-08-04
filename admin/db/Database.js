const mongoose = require('mongoose');

let instance = null;
class Database {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }



    async connect(options) {
        try {
            // Logic to connect to the database
            console.log('Connecting to database...');
            let db = await mongoose.connect(options.connectionString);
            this.connection = db;
            console.log('Database connected successfully');
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }

    disconnect() {
        // Logic to disconnect from the database
    }
}
module.exports = Database;
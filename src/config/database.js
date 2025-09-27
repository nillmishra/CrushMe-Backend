const mongoose = require('mongoose');

const connectDB = async () => {
        await mongoose.connect('mongodb+srv://nillmishra09_db_user:5TC4pdgsa4fLUI2j@newcluster.ww0wsln.mongodb.net/ChrushMeDB');
};

module.exports = connectDB;
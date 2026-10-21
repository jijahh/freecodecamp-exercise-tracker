const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        default: new Date(Date.now()).toString()
    }
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
});

const LogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    log: [ExerciseSchema]
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Exercise: mongoose.model('Exercise', ExerciseSchema),
    Log: mongoose.model('Log', LogSchema)
};
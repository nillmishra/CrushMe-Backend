const mongoose = require('mongoose');


const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message: 'Status is not valid'
        }
    },

},
{
    timestamps: true,
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });    

connectionRequestSchema.pre('save', function(next) {
    const connectionRequest = this;
    // Ensure fromUserId and toUserId are not the same
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        return next(new Error("fromUserId and toUserId cannot be the same"));
    }

    next();
});


const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest; 
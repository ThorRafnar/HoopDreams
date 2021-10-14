const Schema = require('mongoose').Schema;

module.exports = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    basketballFieldId: { type: String, required: true, },
    registeredPlayers: [{ type: Schema.Types.ObjectId, required: true }],
    hostId: { type: Schema.Types.ObjectId, required: true }
}, { autoCreate: true });


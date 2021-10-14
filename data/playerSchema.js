const Schema = require('mongoose').Schema;

const PlayerSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true }
}, { autoCreate: true })


module.exports = PlayerSchema;
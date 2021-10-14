const mongoose = require('mongoose');

const pickupGameSchema = require('./pickupGameSchema');
const playerSchema = require('./playerSchema');

const connectionString = 'mongodb+srv://basketballFan5000:H00PS-ARE-COO1-SL4M-DUNK@hoop-dreams.0sqkw.mongodb.net/hoop-dreams?retryWrites=true&w=majority';
//const connectionString = 'mongodb+srv://admin:admin@hoopdreamsdb.2othp.mongodb.net/myhoopdreamdb?retryWrites=true&w=majority';
const connection = mongoose.createConnection(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = {
    PickupGame: connection.model('PickupGame', pickupGameSchema),
    Player: connection.model('Player', playerSchema),
    connection
};
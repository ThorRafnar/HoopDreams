const basketBallFieldResolver = require('./basketballFieldResolver');
const playerResolver = require('./playerResolver');
const pickupGameResolver = require('./pickupGameResolver');


module.exports = {
    Query: {
        ...basketBallFieldResolver.queries,
        ...pickupGameResolver.queries,
        ...playerResolver.queries
    },
    Mutation: {
        ...pickupGameResolver.mutations,
        ...playerResolver.mutations
    },
    ...basketBallFieldResolver.types,
    ...pickupGameResolver.types,
    ...playerResolver.types
}
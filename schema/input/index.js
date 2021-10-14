module.exports = `
    input PickupGameInput {
        start: Moment!
        end: Moment!
        basketballFieldId: String!
        hostId: String!
    }

    input PlayerInput {
        name: String!
    }
    
    input SignupPlayerInput {
        playerId: String!
        pickupGameId: String!
    }
`;
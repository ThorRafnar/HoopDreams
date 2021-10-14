module.exports = `
    type BasketballField {
        id: ID!
        name: String!
        capacity: Int!
        yearOfCreation: Moment!
        pickupGames: [PickupGame!]!
        status: String!
    }
    
    type PickupGame {
        id: ID!
        start: Moment!
        end: Moment!
        location: BasketballField!
        registeredPlayers: [Player!]!
        host: Player!
    }
    
    type Player {
        id: ID!
        name: String!
        playedGames: [PickupGame!]!
    }
`;
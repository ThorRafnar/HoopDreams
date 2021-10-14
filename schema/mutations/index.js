module.exports = `
    type Mutation {
        createPickupGame(input: PickupGameInput!): PickupGame!
        createPlayer(input: PlayerInput!): Player!
        updatePlayer(id: ID! name: String!): Player!
        removePlayer(id: ID!): Boolean
        removePickupGame(id: ID!): Boolean
        addPlayerToPickupGame(input: SignupPlayerInput): PickupGame!
        removePlayerFromPickupGame(input: SignupPlayerInput): Boolean
    }
`;
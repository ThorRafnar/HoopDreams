const { ApolloError, UserInputError } = require('apollo-server');

class PickupGameExceedMaximumError extends ApolloError {
    constructor(message = 'Pickup game has exceeded the maximum of players.') {
        super(message, 409, message);
        this.name = 'PickupGameExceedMaximumError';
        this.code = 409;
    }
};

class BasketballFieldClosedError extends ApolloError {
    constructor(message = 'Cannot add a pickup game to a closed basketball field') {
        super(message, 400, message);
        this.name = 'BasketballFieldClosedError';
        this.code = 400;
    }
};

class PickupGameOverlapError extends ApolloError {
    constructor(message = 'Pickup games cannot overlap') {
        super(message, 400, message);
        this.name = 'PickupGameOverlapError';
        this.code = 400;
    }
};

class PickupGameAlreadyPassedError extends ApolloError {
    constructor(message = 'Pickup game has already passed') {
        super(message, 400, message);
        this.name = 'PickupGameAlreadyPassedError';
        this.code = 400;
    }
}

class NotFoundError extends ApolloError {
    constructor(message = 'Id was not found') {
        super(message, 404, message);
        this.name = 'NotFoundError';
        this.code = 404;
    }
}

module.exports = {
    PickupGameExceedMaximumError,
    BasketballFieldClosedError,
    PickupGameOverlapError,
    PickupGameAlreadyPassedError,
    NotFoundError,
    UserInputError
};

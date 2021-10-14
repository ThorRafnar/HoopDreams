const basketballFieldService = require('../services/basketballFieldService');
const db = require('../data/db');
const moment = require('moment');
const errors = require('../errors');
require('moment/locale/is');
const mongoose = require("mongoose");
const {basketballFieldById} = require("../services/basketballFieldService");
moment.updateLocale('is');

module.exports = {
    queries: {
        allPickupGames: () => {
            return db.PickupGame.find({}, (err, pickupgames) => {
                if (err) {throw new Error();}
                return pickupgames;
            }).clone().catch(function(err){ console.log(err)})
        },
        pickupGame: async (parent, args) => {
            const id = args.id;
            const game = await db.PickupGame.findOne({_id: id}).select("_id").lean();
            if (game) {
                return db.PickupGame.findById(id, (err, pickupgames) => {
                    if (err) {
                        throw new Error();
                    }
                    return pickupgames;
                }).clone().catch(function (err) {
                });
            }
            throw new errors.NotFoundError;
        }
    },
    mutations: {
        createPickupGame: async (parent, args) => {
            const game = args.input;

            const field = await basketballFieldService.basketballFieldById(game.basketballFieldId);
            if (field == null) { throw new errors.NotFoundError();}
            if (field.status == "CLOSED") {throw new errors.BasketballFieldClosedError();}

            // Find if the host exists
            const host = await db.Player.findOne({_id: game.hostId}).select("_id").lean();
            if (host == null) {throw new errors.NotFoundError();}

            //Start and end as moments
            const start = new moment(game.start);
            const end = new moment(game.end);
            const now = new moment();

            // End cannot be before start
            if (end < start) {
                throw new errors.UserInputError("Games cannot end before they begin");
            }

            // If start or end is before now
            if (start < now || end < now) {
                throw new errors.PickupGameAlreadyPassedError();
            }

            // Check if duration is minimum 5 minutes, and maximum 2 hours
            const duration = moment.duration(end.diff(start));
            const minutes = duration.asMinutes();
            if (minutes < 5 || minutes > 120) {throw new errors.UserInputError("Games must last between 5 minutes and 2 hours.")}

            // Gather hosts games
            const hostGames = await db.PickupGame.find({"registeredPlayers": game.hostId}, (err, pickupgames) => {
                return pickupgames;
            }).clone().catch(function(err){ console.log(err)});

            //Check if any of host games overlap
            for (let i=0; i<hostGames.length; i++) {
                let hg = hostGames[i];
                let hgStart = new moment(hg.start);
                let hgEnd = new moment(hg.end);
                if ((start <= hgEnd) && (hgStart <= end)) {
                    throw new errors.PickupGameOverlapError();
                }
            }

            // Gather field games
            const fieldGames = await db.PickupGame.find({"basketballFieldId": game.basketballFieldId}, (err, pickupgames) => {
                return pickupgames;
            }).clone().catch(function(err){ console.log(err)});

            //Check if any of field games overlap
            for (let i=0; i<fieldGames.length; i++) {
                let fg = fieldGames[i];
                let fgStart = new moment(fg.start);
                let fgEnd = new moment(fg.end);
                if ((start <= fgEnd) && (fgStart <= end)) {
                    throw new errors.PickupGameOverlapError();
                }
            }

            // Add host as registered player
            game.registeredPlayers = [game.hostId];

            return db.PickupGame.create(args.input);
        },

        removePickupGame: async (parent, args) => {
            const id = mongoose.Types.ObjectId(args.id);
            const game = db.PickupGame.findOne({_id: id}).select("_id").lean();
            if (!game) {throw new errors.NotFoundError;}
            const success = await db.PickupGame.findOneAndRemove({_id: id});
            if (success) {return true;}
            throw new errors.NotFoundError;
        },

        addPlayerToPickupGame: async (parent, args) => {
            const pid = args.input.playerId;
            const playerId = mongoose.Types.ObjectId(pid);
            const gameId = mongoose.Types.ObjectId(args.input.pickupGameId);

            // Find if the player exists
            const player = await db.Player.findOne({_id: playerId}).select("_id").lean();
            if (player == null) {throw new errors.NotFoundError();}

            // Find the game
            let game = await db.PickupGame.findOne({_id: gameId}).select("_id").lean();
            if (game == null) {throw new errors.NotFoundError;}
            game = await db.PickupGame.findById(gameId, (err, pickupgames) => {
                if (err) {throw new Error();}
                return pickupgames;
            }).clone().catch(function (err) {});


            // Check if game has started/passed
            const start = new moment(game.start);
            const end = new moment(game.end);
            const now = new moment();
            if (start < now || end < now) {
                throw new errors.PickupGameAlreadyPassedError();
            }

            // Get that players games
            let playersGames = await db.PickupGame.find({"registeredPlayers": playerId}, (err, games) => {
                if (err) {throw new Error();}
                return games;
            }).clone().catch(function (err) {});

            // Loop to check if any overlap
            for (let i=0; i<playersGames.length;i++) {
                let pg = playersGames[i];
                let s = new moment(pg.start);
                let e = new moment(pg.end);

                if ((start <= e) && (s <= end)) {
                    throw new errors.PickupGameOverlapError();
                }
            }

            // Find the field
            const field = await basketballFieldService.basketballFieldById(game.basketballFieldId);
            const capacity = field.capacity;

            // Check if game is at capacity
            if (game.registeredPlayers.length >= capacity) {throw new errors.PickupGameExceedMaximumError();}

            // Check if player is already registered
            if (game.registeredPlayers.includes(pid)) {throw new errors.UserInputError("Player is already registered");}

            let regs = game.registeredPlayers;
            regs.push(pid);

            return db.PickupGame.findOneAndUpdate({"_id": gameId}, {$set: {"registeredPlayers": regs}},  (err, game) => {
                if (err) {throw new Error();}
                return game;
            }).clone().catch(function(err){});
        },

        removePlayerFromPickupGame: async (parent, args) => {
            const playerId = new mongoose.Types.ObjectId(args.input.playerId);
            const gameId = new mongoose.Types.ObjectId(args.input.pickupGameId);

            // Find if the player exists
            const player = await db.Player.findOne({_id: playerId}).select("_id").lean();
            if (player == null) {throw new errors.NotFoundError();}

            // Find the game
            let game = await db.PickupGame.findOne({_id: gameId}).select("_id").lean();
            if (game == null) {throw new errors.NotFoundError;}
            game = await db.PickupGame.findById(gameId, (err, pickupgames) => {
                if (err) {throw new Error();}
                return pickupgames;
            }).clone().catch(function (err) {});

            //If game has already started
            if (moment(game.start).isBefore(moment())) {
                throw new errors.PickupGameAlreadyPassedError();
            }


            if (!game.registeredPlayers.includes(playerId)) {throw new errors.UserInputError("The player is not registered to that game");}
            let index = game.registeredPlayers.indexOf(playerId);
            game.registeredPlayers.splice(index, 1);

            let regs = await db.Player.find({"_id": game.registeredPlayers}, (err, players) => {
                if (err) {throw new Error();}
                return players;
            }).clone().catch(function(err){});

            if (regs.length <= 0) {
                // If there are no players left, remove the game and return
                await db.PickupGame.findByIdAndRemove(gameId);
                return true;
            }

            let newHostId;
            if (game.hostId.toString() == playerId.toString()) {
                regs.sort((a, b) => (a.name > b.name) ? 1 : -1);
                newHostId = regs[0];
            } else {
                newHostId = game.hostId;
            }

            let regIds = [];
            for (let i=0; i<regs.length; i++) {
                regIds[i] = regs[i].id;
            }

            let success = await db.PickupGame.findOneAndUpdate({"_id": gameId}, {$set: {"hostId": newHostId, "registeredPlayers": regIds}});
            if (success == null) {throw new Error();}
            return true;
        }
    },
    types: {
        PickupGame: {
            id: ({_id}) => _id,
            start: ({start}) => {
                return moment(start).format('LLLL');
            },
            end: ({end}) => {
                return moment(end.toString()).format('LLLL');
            },
            location: ({basketballFieldId}) => {
                return basketballFieldService.basketballFieldById(basketballFieldId);
            },
            registeredPlayers: ({registeredPlayers}) => {
                return db.Player.find({'_id': registeredPlayers}, (err, players) => {
                    if (err) {throw new Error();}
                    return players;
                }).clone().catch(function(err){});
            },
            host: ({hostId}) => {
                return db.Player.findById(hostId, (err, players) => {
                    if (err) {throw new errors.NotFoundError;}
                    return players;
                }).clone().catch(function(err){});
            }
        }
    }
}
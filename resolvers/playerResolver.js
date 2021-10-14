const basketballFieldService = require('../services/basketballFieldService');
const mongoose = require('mongoose');
const db = require('../data/db');
const moment = require('moment');
require('moment/locale/is');
const errors = require("../errors");
moment.updateLocale('is');

module.exports = {
    queries: {
        allPlayers: async () => {
            return await db.Player.find({}, (err, players) => {
                if (err) {
                    throw new Error();
                }
                return players;
            }).clone().catch(function (err) {});
        },

        player: async (parent, args) => {
            const id = args.id;
            const player = await db.Player.findOne({_id: id}).select("_id").lean();
            if (player) {
                return await db.Player.findById(id, (err, players) => {
                    if (err) {throw new Error();}
                    return players;
                }).clone().catch(function (err) {});
            }
            throw new errors.NotFoundError;
        }
    },
    mutations: {
        createPlayer: (parent, args) => {
            return db.Player.create(args.input);
        },

        updatePlayer: async (parent, args) => {
            const id = mongoose.Types.ObjectId(args.id);
            const player = await db.Player.findOne({_id: id}).select("_id").lean();
            if (!player) {throw !new errors.NotFoundError;}
            return db.Player.findByIdAndUpdate({_id: id}, {name: args.name}, (err, player) => {
                if (err) {throw new Error();}
                return player;
            }).clone().catch(function(err){});
        },

        removePlayer: async (parent, args) => {
            const id = mongoose.Types.ObjectId(args.id);
            const player = db.Player.findOne({_id: id}).select("_id").lean();
            if (!player) {throw new errors.NotFoundError;}
            let gamesRegistered = await db.PickupGame.find({"registeredPlayers": id}, (err, games) => {
                if (err) {throw new Error();}
                return games;
                }).clone().catch(function(err) {console.log(err)});
            for (let i=0;i<gamesRegistered.length;i++) {
                let regs = gamesRegistered[i].registeredPlayers;

                // Remove the player
                let index = regs.indexOf(id);
                regs.splice(index, 1);

                //there are still players left in that came
                if (regs.length > 0) {
                    await db.PickupGame.updateOne({"_id": gamesRegistered[i].id}, {$set: {"registeredPlayers": regs}});
                } else {
                    // If there are no players left, remove the game
                    await db.PickupGame.findByIdAndRemove(gamesRegistered[i].id);
                }
            }

            let gamesHosted = await db.PickupGame.find({"hostId": id}, (err, games) => {
                if (err) {throw new Error();}
                return games;
            }).clone().catch(function(err) {});

            // Change hostId to first of registered
            for (let i=0;i<gamesHosted.length;i++) {
                let game = gamesHosted[i];
                let regs = gamesRegistered[i].registeredPlayers;
                regs.sort((a, b) => a.name.localeCompare(b.name));
                await db.PickupGame.findOneAndUpdate({"_id": game.id}, {$set: {"hostId": regs[0]}});
            }

            const success = await db.Player.findOneAndRemove({_id: id});
            if (success) {return true;}
            throw new errors.NotFoundError;
        }
    },
    types: {
        Player: {
            id: ({_id}) => _id,
            playedGames: ({_id}) => {
                return db.PickupGame.find({'registeredPlayers': _id}, (err, pickupgames) => {
                    if (err) {throw new Error();}
                    return pickupgames;
                }).clone().catch(function(err){});
            }
        }
    }
}
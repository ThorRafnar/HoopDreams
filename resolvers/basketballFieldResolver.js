const basketballFieldService = require('../services/basketballFieldService');
const db = require('../data/db');
const moment = require('moment');
require('moment/locale/is');
moment.updateLocale('is');

module.exports = {
    queries: {
        allBasketballFields: (parent, args) => {
            return basketballFieldService.basketballFields(args.status);
        },
        basketballField: (parent, args) => {
            return basketballFieldService.basketballFieldById(args.id);
        }
    },
    types: {
        BasketballField: {
            yearOfCreation: ({yearOfCreation}) => {
                return moment(yearOfCreation).format('LLLL');
            },
            pickupGames: ({id}) => {
                return db.PickupGame.find({'basketballFieldId': id}, (err, pickupgames) => {
                    if (err) {throw new Error();}
                    return pickupgames;
                }).clone().catch(function(err){ console.log(err)});
            }
        }
    }
}

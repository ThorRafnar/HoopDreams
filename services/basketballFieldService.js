const bent = require('bent');
const getJSON = bent('json');

const url = 'https://basketball-fields.herokuapp.com/api/basketball-fields';

module.exports = {
    basketballFields : (status) => {
        return getJSON(url)
            .then(function(result) {
            if (status != undefined) {
                let ret = [];
                for (let i=0;i<result.length;i++) {
                    if (result[i].status == status) {
                        ret.push(result[i]);
                    }
                }
                result = ret;
            }
            return result;
        })
    },
    basketballFieldById : (id) => {
        return getJSON(url + '/' + id);
    }
}
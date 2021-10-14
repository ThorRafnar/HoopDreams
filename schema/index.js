const types = require('./types');
const enums = require('./enums');
const mutations = require('./mutations');
const queries = require('./queries');
const scalar = require('./scalar');
const input = require('./input');

module.exports = `
    ${scalar}
    ${types}
    ${enums}
    ${mutations}
    ${queries}
    ${input}
`;


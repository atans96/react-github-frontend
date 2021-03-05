const Mutation = require("./mutation/Mutation");
const Query = require("./query/Query");
const DateResolver = require("./DateResolver");
const resolversArray = [Mutation, Query, DateResolver];
module.exports = resolversArray;

const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:Manolo123!@localhost:5050/node_test');

module.exports = {Sequelize, sequelize};
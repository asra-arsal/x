const path = require('node:path');
const express = require('express');

const api = express.Router();
module.exports = api;

api.use('/v1', require(path.join(__dirname, 'v1', 'v1')));

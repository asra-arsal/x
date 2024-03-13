const path = require('node:path');
const express = require('express');

const misc = express.Router();
module.exports = misc;

misc.use('/login', require(path.join(__dirname, 'login', 'login')));
misc.use('/indicator', require(path.join(__dirname, 'indicator', 'indicator')));

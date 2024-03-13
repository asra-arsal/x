const path = require('node:path');
const express = require('express');

const tweets = express.Router();
module.exports = tweets;

tweets.use('/', require(path.join(__dirname, 'routes', 'tweets.get')));
tweets.use('/create', require(path.join(__dirname, 'routes', 'tweets.create')));
tweets.use('/update', require(path.join(__dirname, 'routes', 'tweets.update')));
tweets.use('/delete', require(path.join(__dirname, 'routes', 'tweets.delete')));
tweets.use('/re-order', require(path.join(__dirname, 're-order', 're-order')));
tweets.use('/publish', require(path.join(__dirname, 'routes', 'tweets.publish')));

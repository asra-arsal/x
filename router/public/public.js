const path = require('node:path');
const express = require('express');

const public = express.Router();
module.exports = public;

public.use('/', require(path.join(__dirname, 'home', 'home')));
public.use('/tweets', require(path.join(__dirname, 'tweets', 'tweets')));
public.use('/retweets', require(path.join(__dirname, 'retweets', 'retweets')));
public.use('/timesheet', require(path.join(__dirname, 'timesheet', 'timesheet')));

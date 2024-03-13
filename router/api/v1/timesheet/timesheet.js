const path = require('node:path');
const express = require('express');

const timesheet = express.Router();
module.exports = timesheet;

timesheet.use('/', require(path.join(__dirname, 'routes', 'timesheet.get')));
timesheet.use('/create', require(path.join(__dirname, 'routes', 'timesheet.create')));
timesheet.use('/update', require(path.join(__dirname, 'routes', 'timesheet.update')));
timesheet.use('/delete', require(path.join(__dirname, 'routes', 'timesheet.delete')));
timesheet.use('/instant', require(path.join(__dirname, 'routes', 'timesheet.instant')));

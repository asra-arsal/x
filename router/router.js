const path = require('node:path');
const express = require('express');

const router = express.Router();
module.exports = router;

router.use('/', require(path.join(__dirname, 'public', 'public')));
router.use('/api', require(path.join(__dirname, 'api', 'api')));

const path = require('path');
const express = require('express');

const login = express.Router();
module.exports = login;

const username = process.env.LOGIN_USER;
const password = process.env.LOGIN_PASS;

const processLogin = require(path.join(__dirname, '..', '..', '..', '..', '..', 'automaton', 'login'));

login.get('/', async (req, res) => {
    const { success, error } = await processLogin(username, password);

    if (!success) {
        return res.status(500).json({
            success: false,
            data: null,
            error,
        });
    }

    res.json({
        success: true,
        data: null,
        error: null,
    });
});

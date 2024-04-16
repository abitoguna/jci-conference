const express = require("express");
const connection = require("../connection");
const moment = require("moment");
const router = express.Router();
const user = require('../routes/user');

router.post('/create', user.verifyToken, async (req, res) => {
    let client;

    try {

    }  catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
});

module.exports = router;
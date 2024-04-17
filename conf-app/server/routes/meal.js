const express = require("express");
const connection = require("../connection");
const moment = require("moment");
const router = express.Router();
const user = require('../routes/user');

router.post('/create/:delegateId', user.verifyToken, async (req, res) => {
    let client;
    try {
        const delegateId = req.params.delegateId;
        // get mode from config
        // get all delegate meals
        // create date with moment and format to DD/MM/YYYY
        // if null
        // create meal with date, delegate id and meal mode
        // if not null
        // update meal mode where delegate id and date 
        const query = "SELECT * FROM meals WHERE delegate_id = $1 AND "

    }  catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
});

router.get('/get/:delegateId', user.verifyToken, async (req, res) => {
    let client;
    try {
        const delegateId = req.params.delegateId ?? null;
        if (!delegateId) {
            return res.status(500).json({ message: 'No delegate selected.' })
        }
        const query = `SELECT * FROM meals WHERE delegate_id = $1`;
        client = await connection.connect();
        const mealResult = await client.query(query, [delegateId]);
        const data = mealResult.rows;
        res.status(200).json({
            data,
            message: 'Successful'
        });
    }  catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
})

module.exports = router;
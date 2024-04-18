const express = require("express");
const connection = require("../connection");
const router = express.Router();
const user = require('../routes/user');

router.put('/update', user.verifyToken, async (req, res) => {
    let client;
    const {
        id,
        isServingMeal,
        mealType,
        banquetMode
    } = req.body;
    try {
        const query = `UPDATE config SET is_serving_meal = $2, meal_type = $3, banquet_mode = $4 WHERE id = $1`;
        client = await connection.connect();
        const updateResult = await client.query(query, [id, isServingMeal, mealType, banquetMode]);
        if (updateResult.rowCount > 0) {
            res.json({ message: "Configuration updated." });
        }
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
});

router.get('/get', user.verifyToken, async (req, res) => {
    let client;
    try {
        client = await connection.connect();
        const configResult = await client.query('SELECT * FROM config');

        const rows = configResult.rows;
        const camelCaseRows = rows.map((row) => {
            const camelCaseRow = {};
            for (const key in row) {
                const camelKey = key.replace(/(_\w)/g, (match) =>
                    match[1].toUpperCase()
                );
                camelCaseRow[camelKey] = row[key];
            }
            return camelCaseRow;
        });
        res
            .status(200)
            .json({
                message: "Successful",
                data: camelCaseRows[0]
            });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
});

module.exports = router;
const express = require("express");
const connection = require("../connection");
const moment = require("moment");
const router = express.Router();
const user = require('../routes/user');

router.post('/create/:delegateId', user.verifyToken, async (req, res) => {
    let client;
    try {
        const delegateId = req.params.delegateId;
        let date = req.body.date;

        client = await connection.connect();
        const config = await client.query('SELECT * FROM config');
        const configResult = config.rows[0];
        if (!configResult.is_serving_meal) {
            return res.status(500).json({ message: 'Meals are not being served.' });
        }
        const mealMode = configResult.meal_type;
        const todayMeals = await client.query("SELECT * FROM meals WHERE delegate_id = $1 AND meal_date = $2", [delegateId, date]);
        const delegateMealForToday = todayMeals.rows;
        if (delegateMealForToday.length === 0) {
            let breakfast, lunch, dinner;
            breakfast = mealMode === 'breakfast' ? true : false;
            lunch = mealMode === 'lunch' ? true : false;
            dinner = mealMode === 'dinner' ? true : false;
            const delegateMealTodayResult = await client.query("INSERT INTO meals (delegate_id, meal_date, breakfast, lunch, dinner) VALUES ($1, $2, $3, $4, $5)", [delegateId, date, breakfast, lunch, dinner]);
            if (delegateMealTodayResult.rowCount > 0) {
                return res.json({ message: 'Meal is served.' });
            }
        } else {
            const mealTodayId = delegateMealForToday[0].meal_id;
            const { breakfast, lunch, dinner } = delegateMealForToday[0];
            if ((breakfast && mealMode === 'breakfast') || (lunch && mealMode === 'lunch') || (dinner && mealMode === 'dinner')) {
                return res.status(500).json({ message: 'Meal is already served for this delegate.' });
            }
            mealQuery = `UPDATE meals SET ${mealMode} = true WHERE meal_id = $1`;
            const delegateMealTodayResult = await client.query(mealQuery, [mealTodayId]);
            if (delegateMealTodayResult.rowCount > 0) {
                return res.json({ message: 'Meal is served.' });
            }
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
});

router.get('/get/:delegateId/', user.verifyToken, async (req, res) => {
    let client;
    try {
        const delegateId = req.params.delegateId ?? null;
        const date = req.query.date ?? null;
        if (!delegateId) {
            return res.status(500).json({ message: 'No delegate selected.' })
        }
        const query = `SELECT * FROM meals WHERE delegate_id = $1 ${date ? 'AND meal_date = $2' : ''}`;
        client = await connection.connect();
        const mealResult = await client.query(query, [delegateId, date]);
        const data = mealResult.rows;
        res.status(200).json({
            data,
            message: 'Successful'
        });
    } catch (err) {
        res.status(500).send({ message: "Something went wrong, please try again." });
    } finally {
        await client.release();
    }
})

module.exports = router;
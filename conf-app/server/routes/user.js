const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const secret = process.env.NPM_Install;


/* @swagger
* /api/resource:
* get:
* summary: Get a resource
* description: Get a specific resource by ID.
* parameters:
* — in: path
* name: id
* required: true
* description: ID of the resource to retrieve.
* schema:
* type: string
* responses:
* 200:
* description: Successful response
*/

async function findUserByEmailOrUsername(identifier) {
    const client = await connection.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1 OR username = $2', [identifier, identifier]);
        const user = result.rows[0];
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
          throw error;
    } finally {
        await client.release();
    }
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.post('/login', async (req, res) => {
    const { password, username } = req.body;

    try {
        const user = await findUserByEmailOrUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect username or password' });
        }
        const payload = { userId: user.id, username: user.username, team: user.team };
        const token = jwt.sign(payload, secret, { expiresIn: '6h' });

        return res.status(200).json({ token });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Something went wrong, could not log you in. Try again." });
    }
});

router.post('/signup', verifyToken, async (req, res) => {
    const { username, email, password, pin, team } = req.body;
    let client;
    if (parseInt(pin) !== parseFloat(process.env.SIGN_PORT)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const userCheck = await findUserByEmailOrUsername(email);
        if (userCheck) {
            return res.status(400).json({ messgae: 'Username and/or email has be taken. Please choose a different one.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        client = await connection.connect();

        await client.query('INSERT INTO users (username, email, password, team) VALUES ($1, $2, $3, $4)', [username, email, hashedPassword, team]);

        res.json({ message: 'Registration successful. Please login now.' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "User could not be added." });
    } finally {
        await client.release();
    }
})

const userExports = {
    router, verifyToken
}

module.exports = userExports;
const express = require('express');
const connection = require('../connection');
const moment = require('moment');
const router = express.Router();

/* @swagger
* /api/resource:
* get:
* summary: Add Delegate to the system
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
router.post('/create', (req, res) => {
    let delegate = req.body;
    const email = connection.escape(delegate.email);
    let query = `SELECT * FROM delegate WHERE email = ${email}`;
    connection.query(query, [delegate.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                query = "INSERT INTO Delegate(firstName,lastName,email,phoneNumber,gender,membershipType,localOrganisation) values(?,?,?,?,?,?,?)";
                connection.query(query, [delegate.firstName, delegate.lastName, delegate.email, delegate.phoneNumber, delegate.gender, delegate.membershipType, delegate.localOrganisation], (err, result) => {
                    if (!err) {
                        return res.status(200).json({message: 'Delegate successfully added.'})
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({message: "Email already exists"});
            }
        } else {
            return res.status(500).json(err);
        }
    });
    
});

router.get('/getAll', (req, res) => {
    let query = 'SELECT * FROM delegate';
    connection.query(query, (err, result) => {
        if (!err) {
            return res.status(200).json({message: 'Successful', data: result});
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;
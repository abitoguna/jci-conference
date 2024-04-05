const express = require("express");
const connection = require("../connection");
const moment = require("moment");
const router = express.Router();
const sendEmailNotification = require("../email.service");
const user = require('../routes/user');

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
router.post("/create", user.verifyToken, async (req, res) => {
    let client;
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            membershipType,
            gender,
            localOrganisation,
        } = req.body;

        if (!firstName || !email || !lastName) {
            return res.status(400).send("Missing required fields: name and email");
        }

        client = await connection.connect();

        // Check for existing email
        const result = await client.query(
            "SELECT * FROM delegates WHERE email = $1",
            [email]
        );
        if (result.rows.length > 0) {
            return res.status(400).send("Email already exists");
        }

        await client.query(
            "INSERT INTO delegates (firstName, lastName, email, phoneNumber, gender, membershipType, localOrganisation) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
                firstName,
                lastName,
                email,
                phoneNumber,
                gender,
                membershipType,
                localOrganisation,
            ]
        );

        res.status(201).send({ message: "Delegate added successfully" });
    } catch (err) {
        res.status(500).send({ message: "Delegate could not be added." });
    } finally {
        await client.release();
    }
});

router.get("/getAll", user.verifyToken, async (req, res) => {
    let client;
    try {
        const page = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const offset = (page - 1) * pageSize;
        const filterBy = req.query.filter;

        client = await connection.connect();

        if (filterBy === "all") {
            const [delegateResult, totalResult] = await Promise.all([
                client.query(`SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected
                FROM delegates 
                ORDER BY firstname ASC
                LIMIT ${pageSize}
                ${offset > 0 ? `OFFSET ${offset}` : ""}`),
                client.query("SELECT COUNT(*) FROM delegates"),
            ]);
            const rows = delegateResult.rows;
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
            const totalCount = totalResult.rows[0].count;
            res
                .status(200)
                .json({
                    message: "Successful",
                    data: camelCaseRows,
                    page,
                    pageSize,
                    totalCount: parseInt(totalCount),
                });
        } else {
            const isRegistered = filterBy === 'registered' ? true : false;
            const query = `SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected,
            COUNT(*) OVER (PARTITION BY 1) AS total_count
            FROM delegates
            WHERE isregistered = $1
            ORDER BY firstname ASC
            LIMIT $2
            OFFSET $3`;

            const delegateResult = await client.query(query, [
                isRegistered,
                pageSize,
                offset,
            ]);
            const rows = delegateResult.rows;
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
                    data: camelCaseRows,
                    page,
                    pageSize,
                    totalCount: parseInt(delegateResult.rows[0]?.total_count ?? 0),
                });
        }
    } catch (err) {
        res.status(500).send({ message: "Error fetching delegates" });
    } finally {
        await client.release();
    }
});

router.get("/search", user.verifyToken, async (req, res) => {
    let client;
    try {
        const searchTerm = req.query.name || "";
        if (searchTerm.length < 3) {
            return res.status(400).json({ message: "Enter at least 3 characters" });
        }
        const page = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const offset = (page - 1) * pageSize;
        const filterBy = req.query.filter;

        client = await connection.connect();

        const query = `SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected,
            COUNT(*) OVER (PARTITION BY 1) AS total_count
            FROM delegates
            WHERE firstname ILIKE $1
            ${filterBy === 'registered' ? 'AND isregistered = true' : filterBy === 'unregistered' ? 'AND isregistered = false' : ''}
            ORDER BY firstname ASC
            LIMIT $2
            OFFSET $3`;

        const delegateResult = await client.query(query, [
            `%${searchTerm}%`,
            pageSize,
            offset,
        ]);

        const rows = delegateResult.rows;
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
                data: camelCaseRows,
                page,
                pageSize,
                totalCount: parseInt(delegateResult.rows[0]?.total_count ?? 0),
            });
    } catch (err) {
        return res.status(500).send({ message: "Error searching delegates" });
    } finally {
        await client.release();
    }
});

router.put("/register", user.verifyToken, async (req, res) => {
    let client;
    try {
        const delegateEmail = req.body.email;
        if (!delegateEmail) {
            return res
                .status(400)
                .send({ message: "Delegate email cannot be empty." });
        }
        client = await connection.connect();
        const result = await client.query(
            "SELECT * FROM delegates WHERE email = $1",
            [delegateEmail]
        );
        if (result.rows.length <= 0) {
            return res.status(400).send("Delegate not found");
        }
        const delegate = result.rows[0];
        if (delegate.isregistered) {
            return res
                .status(400)
                .send({ message: "Delegate has already been registered." });
        }
        const registrationDate = moment();

        const registerResult = await client.query(
            "UPDATE delegates SET isregistered = $1, kitcollected = $2, registrationdate = $3 WHERE email = $4",
            [true, true, registrationDate, delegateEmail]
        );

        if (registerResult.rowCount > 0) {
            sendEmailNotification(
                delegate.firstname,
                delegate.lastname,
                delegate.email
            );
            res.json({ message: "Delegate registered." });
        } else {
            res.status(404).send("Delegate not found.");
        }
    } catch (err) {
        return res.status(500).send({ message: "Could not register delegate." });
    } finally {
        await client.release();
    }
});

module.exports = router;

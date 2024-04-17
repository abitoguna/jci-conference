const express = require("express");
const connection = require("../connection");
const moment = require("moment");
const router = express.Router();
const sendEmailNotification = require("../email.service");
const user = require('../routes/user');
const QRCode = require('qrcode');

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
            isregistered,
            kitCollected,
            isLateRegistration,
            isOnlineRegistration
        } = req.body;
        const loggedInUser = req.user;

        if (loggedInUser.team !== 'admin') {
            return res.status(500).send({ message: 'You are not authorized to perform this. How did you get here ?' });
        }

        if (!firstName || !email || !lastName) {
            return res.status(400).send({ message: "Missing required fields: name and email" });
        }

        client = await connection.connect();

        // Check for existing email
        const result = await client.query(
            "SELECT * FROM delegates WHERE email = $1",
            [email]
        );
        if (result.rows.length > 0) {
            return res.status(400).send({ message: "Email already exists" });
        }

        await client.query(
            "INSERT INTO delegates (firstName, lastName, email, phoneNumber, gender, membershipType, localOrganisation, isRegistered, kitCollected, isLateRegistration, isOnlineRegistration, registeredBy, registrationDate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
            [
                firstName,
                lastName,
                email,
                phoneNumber,
                gender,
                membershipType,
                localOrganisation,
                isregistered ?? false,
                kitCollected ?? false,
                isLateRegistration,
                isOnlineRegistration,
                isregistered ? loggedInUser.username : null,
                isregistered ? moment() : null
            ]
        );
        if (isregistered) {
            sendEmailNotification(
                firstname,
                lastname,
                email
            );
        }
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
                client.query(`SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected, registeredby AS registered_by, islateregistration AS is_late_registration, isonlineregistration AS is_online_registration,
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
            const query = `SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected, registeredby AS registered_by, islateregistration AS is_late_registration, isonlineregistration AS is_online_registration,
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
        console.log(err);
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

        const query = `SELECT id AS id, firstname AS first_name, lastname AS last_name, gender AS gender, email AS email, membershiptype AS membership_type, localorganisation AS local_organisation, isregistered AS is_registered, phonenumber AS phone_number, registrationdate AS registration_date, kitcollected AS kit_collected, registeredby AS registered_by, islateregistration AS is_late_registration, isonlineregistration AS is_online_registration
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
        const loggedInUser = req.user;
        const isKitCollected = req.body.isKitCollected ?? true;
        const cancelRegistration = req.body.cancelRegistration ?? false;
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

        if (cancelRegistration) {
            await client.query("UPDATE delegates SET isregistered = $1, kitcollected = $2, registrationdate = $3, registeredby = $5 WHERE email = $4", [false, false, null, delegateEmail, null]);
            return res.status(200).json({ message: 'Registration canceled for delegate.' })
        } else {

            const registrationDate = moment();
            const registerResult = await client.query(
                "UPDATE delegates SET isregistered = $1, kitcollected = $2, registrationdate = $3, registeredby = $5 WHERE email = $4",
                [true, isKitCollected, registrationDate, delegateEmail, loggedInUser.username]
            );

            if (registerResult.rowCount > 0) {
                const qrCodeText = `https://jciconf.netlify.app/#/scantag/${delegate.id}`;
                const qrCodeData = await generateQRCode(qrCodeText);
                const qrCode = {
                      name: `${delegate.firstname}-${delegate.lastname}-etag.png`,
                      content: qrCodeData.replace(/^data:image\/\w+;base64,/, '')
                    };
                  
                if (!delegate.isregistered) {
                    sendEmailNotification(
                        delegate.firstname,
                        delegate.lastname,
                        delegate.email,
                        qrCode,
                        qrCodeText
                    );
                    res.json({ message: "Delegate registered." });
                } else {
                    res.json({ message: 'Delegate updated.' })
                }
            } else {
                res.status(404).send("Something went wrong, please try again.");
            }
        }


    } catch (err) {
        return res.status(500).send({ message: "Could not register delegate." });
    } finally {
        await client.release();
    }
});

router.put('/update/:id', user.verifyToken, async (req, res) => {
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
            isLateRegistration
        } = req.body;
        const delegateId = req.params.id ?? null;
        if (!delegateId) {
            return res.status(500).json({ message: 'No delegate found.' });
        }
        client = await connection.connect();
        const updateResult = await client.query("UPDATE delegates SET firstname = $2, lastname = $3, email = $4, phonenumber = $5, membershiptype = $6, gender = $7, localorganisation = $8, islateregistration = $9 WHERE id = $1", [delegateId, firstName, lastName, email, phoneNumber, membershipType, gender, localOrganisation, isLateRegistration]);
        if (updateResult.rowCount > 0) {
            res.json({ message: "Delegate updated." });
        }
    } catch (err) {
        return res.status(500).send({ message: "Something went wrong. Could not update delegate. Please try again." });
    } finally {
        await client.release();
    }
});

router.get('/getNameTag/:id', async (req, res) => {
    let client;
    try {
        const delegateId = req.params.id ?? null;
        if (!delegateId) {
            return res.status(500).json({ message: 'No delegate found.' })
        }

        client = await connection.connect();
        const delegateResult = await client.query('SELECT id AS id, firstname AS first_name, lastname AS last_name, membershiptype AS membership_type, localorganisation AS local_organisation FROM delegates WHERE id = $1', [delegateId]);
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

        res.status(200).json({
            message: 'Successsful',
            data: camelCaseRows[0]
        })
    } catch (err) {
        return res.status(500).send({ message: "Something went wrong. Please try again." });
    } finally {
        await client.release();
    }
});

async function generateQRCode(text) {
    try {
      const qrData = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
      return qrData;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

module.exports = router;

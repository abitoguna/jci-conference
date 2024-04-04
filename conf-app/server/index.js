const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
var cors = require('cors');
// const connection = require('./connection');
const userRoute = require('./routes/user');
const delegateRoute = require('./routes/delegate');
const app =  express();

// Serve swagger documentation
app.use('/api-docs', swaggerUI.serve,swaggerUI.setup(swaggerSpec));


app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/user', userRoute);
app.use('/delegate', delegateRoute);
app.get("/", (req, res) => res.send("Conf api here..."));



module.exports = app;
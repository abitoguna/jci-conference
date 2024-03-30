require('dotenv').config();
const http = require('http');
const app = require('./index');
const server = http.createServer(app);
const port = process.env.PORT;
const hostname = process.env.DB_HOST;
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


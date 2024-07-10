const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const admin = require('./routes/admin');
const client = require('./routes/client');
const morgan = require('morgan');
const dotenv = require('dotenv').config()
require('./config/connection');


// Load environment variables from .env file

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));

const port = process.env.PORT || 5000;

app.use('/', client);
app.use('/admin', admin);

server.listen(port, () => {
    console.log(`Server successfully running on port ${port}`);
});

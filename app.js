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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN,);
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

const port = process.env.PORT || 5000;

app.use('/', client);
app.use('/admin', admin);

server.listen(port, () => {
    console.log(`Server successfully running on port ${port}`);
});

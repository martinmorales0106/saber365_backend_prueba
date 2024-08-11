const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

require("dotenv").config();

const { FRONTEND_URL, FRONTEND_URL2 } = process.env;

const routes = require('./routes/index.js');

const server = express();

server.name = 'API';

// Middlewares
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));
server.use((req, res, next) => {
  // Permitir solicitudes desde múltiples dominios
  const allowedOrigins = [FRONTEND_URL, FRONTEND_URL2];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Rutas
server.use('/', routes);

module.exports = server;

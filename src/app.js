const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors'); // <<--- importar cors

require("dotenv").config();

const { FRONTEND_URL, FRONTEND_URL2, FRONTEND_URL3 } = process.env;

const routes = require('./routes/index.js');

const server = express();
server.name = 'API';

// Configurar CORS
const allowedOrigins = [FRONTEND_URL, FRONTEND_URL2, FRONTEND_URL3];

server.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (como curl o postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir enviar cookies y auth headers
}));

// Otros middlewares
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

// Tus rutas
server.use('/', routes);

module.exports = server;



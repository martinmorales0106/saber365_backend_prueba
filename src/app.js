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
// Lista blanca de orígenes permitidos
const whiteList = [FRONTEND_URL, FRONTEND_URL2, FRONTEND_URL3];

server.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (como Postman o Apps móviles)
    if (!origin) return callback(null, true);
    
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origen bloqueado: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true // Importante para cookies/sesiones
}));

// Otros middlewares
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

// Tus rutas
server.use('/', routes);

module.exports = server;



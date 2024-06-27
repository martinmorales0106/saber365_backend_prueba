const { Router } = require("express");
const checkAuth = require("../middleware/checkAuth");
const { obtenerSimulacrosUsuario } = require("../controllers/perfilUsuarioController");
const { obtenerPregunta } = require("../controllers/preguntaController");

const routePerfilUsuario = Router();

routePerfilUsuario.get("/obtener-simulacros", checkAuth, obtenerSimulacrosUsuario);
routePerfilUsuario.get("/obtener-preguntas", checkAuth, obtenerPregunta);


module.exports = routePerfilUsuario;
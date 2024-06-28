const { Router } = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  obtenerSimulacrosUsuario,
  obtenerPreguntasUsuario,
  simulacroRealizado,
  simulacroFinalizado,
  obtenerResultadoSimulacro,
  obtenerSimulacroRealizado,
} = require("../controllers/perfilUsuarioController");

const routePerfilUsuario = Router();

routePerfilUsuario.get(
  "/obtener-simulacros",
  checkAuth,
  obtenerSimulacrosUsuario
);
routePerfilUsuario.get(
  "/obtener-preguntas",
  checkAuth,
  obtenerPreguntasUsuario
);
routePerfilUsuario.post("/simulacro-realizado", checkAuth, simulacroRealizado);
routePerfilUsuario.post(
  "/simulacro-finalizado",
  checkAuth,
  simulacroFinalizado
);
routePerfilUsuario.get(
  "/simulacro-finalizado/:id",
  checkAuth,
  obtenerResultadoSimulacro
);

routePerfilUsuario.get(
  "/simulacro-realizado/:id",
  checkAuth,
  obtenerSimulacroRealizado,
);

module.exports = routePerfilUsuario;

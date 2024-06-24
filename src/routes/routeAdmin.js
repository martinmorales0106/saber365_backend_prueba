const { Router } = require("express");
const {
  obtenerUsuarios,
  eliminarUsuario,
  usuariosEliminados,
  recuperarUsuario,
  crearUsuario,
  editarUsuario,
} = require("../controllers/adminController");

const checkAuthAdmin = require("../middleware/checkAuthAdmin");

const {
  crearSimulacro,
  obtenerSimulacro,
  eliminarSimulacro,
  simulacrosEliminados,
  recuperarSimulacro,
  editarSimulacro,
} = require("../controllers/simulacroController");

const {
  crearPregunta,
  obtenerPregunta,
  eliminarPregunta,
  preguntasEliminadas,
  recuperarPregunta,
  editarPregunta,
} = require("../controllers/preguntaController");

const routeAdmin = Router();

routeAdmin.post("/crear-usuario", checkAuthAdmin, crearUsuario);
routeAdmin.get("/obtener-usuarios", checkAuthAdmin, obtenerUsuarios);
routeAdmin.delete("/eliminar-usuario/:id", checkAuthAdmin, eliminarUsuario);
routeAdmin.get("/usuarios-eliminados", checkAuthAdmin, usuariosEliminados);
routeAdmin.put("/recuperar-usuario/:id", checkAuthAdmin, recuperarUsuario);
routeAdmin.put("/editar-usuario/:id", checkAuthAdmin, editarUsuario);

routeAdmin.post("/crear-simulacro", checkAuthAdmin, crearSimulacro);
routeAdmin.get("/obtener-simulacros", checkAuthAdmin, obtenerSimulacro);
routeAdmin.delete("/eliminar-simulacro/:id", checkAuthAdmin, eliminarSimulacro);
routeAdmin.get("/simulacros-eliminados", checkAuthAdmin, simulacrosEliminados);
routeAdmin.put("/recuperar-simulacro/:id", checkAuthAdmin, recuperarSimulacro);
routeAdmin.put("/editar-simulacro/:id", checkAuthAdmin, editarSimulacro);

routeAdmin.post("/crear-pregunta", checkAuthAdmin, crearPregunta);
routeAdmin.get("/obtener-preguntas", checkAuthAdmin, obtenerPregunta);
routeAdmin.delete("/eliminar-pregunta/:id", checkAuthAdmin, eliminarPregunta);
routeAdmin.get("/preguntas-eliminados", checkAuthAdmin, preguntasEliminadas);
routeAdmin.put("/recuperar-pregunta/:id", checkAuthAdmin, recuperarPregunta);
routeAdmin.put("/editar-pregunta/:id", checkAuthAdmin, editarPregunta);

module.exports = routeAdmin;

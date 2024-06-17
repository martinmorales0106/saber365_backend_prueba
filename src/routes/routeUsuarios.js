const { Router } = require("express");
const {
  registrar,
  autenticar,
  perfil,
  confirmar,
  comprobarToken,
} = require("../controllers/usuarioController");
const checkAuth = require("../middleware/checkAuth");

const routeUsuarios = Router();

routeUsuarios.post("/", registrar);
routeUsuarios.post("/login", autenticar);
routeUsuarios.get("/perfil", checkAuth, perfil);
routeUsuarios.get("/confirmar/:token", confirmar);

routeUsuarios.route("/olvide-password/:token").get(comprobarToken);

module.exports = routeUsuarios;

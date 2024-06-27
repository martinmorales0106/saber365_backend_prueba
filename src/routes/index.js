const { Router } = require("express");
const routeUsuarios = require("./routeUsuarios");
const routeAdmin = require("./routeAdmin");
const routePerfilUsuario = require("./routePerfilUsuario");

const router = Router();

router.use("/api/usuarios", routeUsuarios);
router.use("/api/admin", routeAdmin);
router.use("/api/perfil-usuario", routePerfilUsuario);

module.exports = router;
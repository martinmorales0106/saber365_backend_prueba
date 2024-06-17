const { Router } = require("express");
const routeUsuarios = require("./routeUsuarios");

const router = Router();

router.use("/api/usuarios", routeUsuarios);

module.exports = router;
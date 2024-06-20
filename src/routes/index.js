const { Router } = require("express");
const routeUsuarios = require("./routeUsuarios");
const routeAdmin = require("./routeAdmin");

const router = Router();

router.use("/api/usuarios", routeUsuarios);
router.use("/api/admin", routeAdmin);

module.exports = router;
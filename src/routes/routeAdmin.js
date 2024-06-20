const { Router } = require("express");
const { obtenerUsuarios, eliminarUsuario, usuariosEliminados, recuperarUsuario, crearUsuario, editarUsuario } = require("../controllers/adminController");
const checkAuthAdmin = require("../middleware/checkAuthAdmin");

const routeAdmin = Router();

routeAdmin.post("/crear-usuario", checkAuthAdmin, crearUsuario);
routeAdmin.get("/obtener-usuarios", checkAuthAdmin, obtenerUsuarios);
routeAdmin.delete("/eliminar-usuario/:id", checkAuthAdmin, eliminarUsuario);
routeAdmin.get("/usuarios-eliminados", checkAuthAdmin, usuariosEliminados);
routeAdmin.put("/recuperar-usuario/:id", checkAuthAdmin, recuperarUsuario);
routeAdmin.put("/editar-usuario/:id", checkAuthAdmin, editarUsuario);

module.exports = routeAdmin;

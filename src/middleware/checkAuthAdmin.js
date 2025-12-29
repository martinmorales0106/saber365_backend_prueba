const checkAuth = require("./checkAuth");

const checkAuthAdmin = async (req, res, next) => {
  // Ejecuta primero la verificación de token normal
  checkAuth(req, res, async () => {
    // Si checkAuth pasó (llamó a next), req.usuario ya existe
    if (req.usuario && req.usuario.admin === true) {
      return next();
    } else {
      // Usamos 403 Forbidden (Entendí quién eres, pero no tienes permiso)
      return res.status(403).json({ msg: "Acceso denegado: Se requieren permisos de administrador." });
    }
  });
};

module.exports = checkAuthAdmin;
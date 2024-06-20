const { Usuario } = require("../db");
const { Op } = require("sequelize");
const { emailRegistro, emailOlvidePassword } = require("../helpers/email");
const generarId = require("../helpers/generarId");
const generarJWT = require("../helpers/generarJWT");

const registrar = async (req, res) => {
  try {
    const {
      nombreUsuario,
      email,
      colegio,
    } = req.body;

    
    // Verificar si ya existe un usuario con el mismo nombre de usuario, incluidos los eliminados
    const existeUsuario = await Usuario.findOne({
      where: { nombreUsuario },
      paranoid: false, // Incluir usuarios eliminados
    });

    if (existeUsuario) {
      if (existeUsuario.deletedAt) {
        return res.status(400).json({
          msg: `Nombre de usuario ya registrado pero fue eliminado el ${existeUsuario.deletedAt}. Por favor, contacta al administrador para más detalles.`,
        });
      } else {
        return res.status(400).json({
          msg: "Nombre de usuario ya registrado. Por favor, elige otro nombre de usuario.",
        });
      }
    }


    // Verificar si ya existe un email con el mismo correo electrónico, incluidos los eliminados
    const existeEmail = await Usuario.findOne({
      where: { email },
      paranoid: false, // Incluir usuarios eliminados
    });

    if (existeEmail) {
      if (existeEmail.deletedAt) {
        return res.status(400).json({
          msg: `Correo electrónico ya registrado pero fue eliminado el ${existeEmail.deletedAt}. Por favor, contacta al administrador para más detalles.`,
        });
      } else {
        return res.status(400).json({
          msg: "Correo electrónico ya registrado. Por favor, utiliza otro correo electrónico.",
        });
      }
    }

    // Crear un nuevo usuario con los datos del cuerpo de la solicitud
    const nuevoUsuario = await Usuario.create(req.body);

    // Generar un nuevo token
    const token = generarId();

    // Asignar el token al nuevo usuario
    nuevoUsuario.token = token;
    nuevoUsuario.colegio = colegio.toUpperCase();

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    emailRegistro({
      email: nuevoUsuario.email,
      nombreUsuario: nuevoUsuario.nombreUsuario,
      token: nuevoUsuario.token,
    });

    return res.status(201).json({
      msg: "Usuario creado correctamente. Revisa tu correo electrónico para confirmar tu cuenta.",
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

const autenticar = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por nombre de usuario o correo electrónico
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [
          { nombreUsuario: username },
          { email: username },
        ],
      },
    });

    if (!usuario) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ msg: error.message });
    }

    // Comprobar la contraseña
    if (password.length < 8) {
      const error = new Error("La Contraseña debe tener mínimo 8 caracteres");
      return res.status(401).json({ msg: error.message });
    }

    const contraseñaValida = await usuario.comprobarPassword(password);
    if (!contraseñaValida) {
      const error = new Error("Contraseña incorrecta");
      return res.status(401).json({ msg: error.message });
    }

    if (!usuario.confirmado) {
      const error = new Error(
        "Tu cuenta no ha sido confirmada, revisa tu correo electrónico"
      );
      return res.status(403).json({ msg: error.message });
    }
    // Si la contraseña es válida, generar un token JWT y responder con la información del usuario
    const token = generarJWT(usuario.id);

    return res.status(201).json({
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      grado: usuario.grado,
      colegio: usuario.colegio,
      admin: usuario.admin,
      token,
    });
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  try {
    const usuarioConfirmar = await Usuario.findOne({
      where: { token: token },
    });

    if (!usuarioConfirmar) {
      const error = new Error("Token no válido");
      return res.status(403).json({ msg: error.message });
    }

    if (usuarioConfirmar.confirmado) {
      const error = new Error("El usuario ya está confirmado");
      return res.status(400).json({ msg: error.message });
    }

    // Marcar al usuario como confirmado y eliminar el token
    usuarioConfirmar.confirmado = true;
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.error("Error al confirmar usuario:", error);
    res.status(500).json({ msg: "Ocurrió un error al confirmar el usuario" });
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  try {
    const tokenValido = await Usuario.findOne({ where: { token: token } });

    if (tokenValido) {
      res.json({ msg: "Token válido y el Usuario existe" });
    } else {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
  } catch (error) {
    console.error("Error en comprobar Token:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  registrar,
  autenticar,
  perfil,
  confirmar,
  comprobarToken,
};

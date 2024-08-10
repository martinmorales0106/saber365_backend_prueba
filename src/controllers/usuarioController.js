const { Usuario } = require("../db");
const { Op } = require("sequelize");
const { emailRegistro, emailOlvidePassword } = require("../helpers/email");
const generarId = require("../helpers/generarId");
const generarJWT = require("../helpers/generarJWT");
const bcrypt = require("bcrypt");

const registrar = async (req, res) => {
  try {
    const { nombreUsuario, email, colegio } = req.body;

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
        [Op.or]: [{ nombreUsuario: username }, { email: username }],
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
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      departamento: usuario.departamento,
      municipio: usuario.municipio,
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

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar al usuario por email en la base de datos
    const usuario = await Usuario.findOne({ where: { email: email } });

    // Si no se encuentra ningún usuario con ese email
    if (!usuario) {
      const error = new Error("El Usuario no existe");
      return res.status(404).json({ msg: error.message });
    }

    // Generar un nuevo token y guardarlo en la base de datos del usuario
    const token = generarId(); // Asumiendo que generarId() genera un token único
    usuario.token = token; // Asignar el nuevo token al usuario
    await usuario.save(); // Guardar el usuario actualizado en la base de datos

    // Enviar el correo electrónico para restablecer la contraseña
    emailOlvidePassword({
      email: usuario.email,
      nombreUsuario: usuario.nombreUsuario, // Ajusta el nombre del campo si es necesario
      token: token,
    });

    // Respuesta exitosa
    return res.json({
      msg: "Hemos enviado un correo electrónico con las instrucciones para restablecer la contraseña",
    });
  } catch (error) {
    console.error("Error en la función olvidar Password:", error);
    return res
      .status(500)
      .json({ msg: "Ocurrió un error al procesar la solicitud" });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Buscar al usuario por el token dado
    const usuario = await Usuario.findOne({ where: { token: token } });

    // Si se encuentra un usuario con el token dado
    if (usuario) {
      // Generar el hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Actualizar la contraseña y limpiar el token
      await usuario.update({ password: hashedPassword, token: null });

      return res.json({ msg: "Contraseña modificada correctamente" });
    } else {
      const error = new Error(
        "Token no válido. Genera otro token en olvide mi contraseña."
      );
      return res.status(404).json({ msg: error.message });
    }
  } catch (error) {
    console.error("Error en nuevoPassword:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreUsuario,
      email,
      colegio,
      grado,
      nombres,
      apellidos,
      departamento,
      municipio,
      afiliado,
    } = req.body;

    const usuarioBd = await Usuario.findByPk(id, { paranoid: false });

    if (!usuarioBd) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si ya existe un usuario con el mismo nombre de usuario

    if (nombreUsuario && nombreUsuario !== usuarioBd.dataValues.nombreUsuario) {
      const existeUsuario = await Usuario.findOne({
        where: { nombreUsuario },
        paranoid: false,
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
    }

    // Verificar si el nuevo email ya está registrado por otro usuario
    if (email && email !== usuarioBd.dataValues.email) {
      const emailExists = await Usuario.findOne({
        where: { email },
        paranoid: false,
      });

      if (emailExists) {
        if (emailExists.deletedAt) {
          return res.status(400).json({
            msg: `Correo electrónico ya registrado pero fue eliminado el ${emailExists.deletedAt}. Por favor, contacta al administrador para más detalles.`,
          });
        } else {
          return res.status(400).json({
            msg: "Correo electrónico ya registrado. Por favor, utiliza otro correo electrónico.",
          });
        }
      }
    }

    // Actualizar campos de perfil
    usuarioBd.nombreUsuario = nombreUsuario || usuarioBd.nombreUsuario;
    usuarioBd.email = email || usuarioBd.email;
    usuarioBd.colegio = colegio ? colegio.toUpperCase() : usuarioBd.colegio;
    usuarioBd.grado = grado || usuarioBd.grado;
    usuarioBd.nombres = nombres || usuarioBd.nombres;
    usuarioBd.apellidos = apellidos || usuarioBd.apellidos;
    usuarioBd.departamento = departamento || usuarioBd.departamento;
    usuarioBd.municipio = municipio || usuarioBd.municipio;
    usuarioBd.afiliado = afiliado || usuarioBd.afiliado;

    // Guardar los cambios
    await usuarioBd.save();

    // Crear un nuevo objeto excluyendo los campos no deseados
    const usuarioActualizado = {
      id: usuarioBd.id,
      nombres: usuarioBd.nombres,
      apellidos: usuarioBd.apellidos,
      nombreUsuario: usuarioBd.nombreUsuario,
      grado: usuarioBd.grado,
      email: usuarioBd.email,
      colegio: usuarioBd.colegio,
      departamento: usuarioBd.departamento,
      municipio: usuarioBd.municipio,
      afiliado: usuarioBd.afiliado,
      confirmado: usuarioBd.confirmado,
      admin: usuarioBd.admin,
    };

    res
      .status(200)
      .json({
        msg: "Usuario actualizado exitosamente",
        usuario: usuarioActualizado,
      });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ msg: "Error al editar usuario" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, nuevoPassword } = req.body;

    const usuarioBd = await Usuario.findByPk(id, { paranoid: false });

    if (!usuarioBd) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const contraseñaValida = await usuarioBd.comprobarPassword(password);
    if (!contraseñaValida) {
      const error = new Error("Contraseña incorrecta");
      console.log(error);
      return res.status(401).json({ msg: error.message });
    }

    if (nuevoPassword) {
      const salt = await bcrypt.genSalt(10);
      usuarioBd.password =
        (await bcrypt.hash(nuevoPassword, salt)) || usuarioBd.password;
    }

    await usuarioBd.save();

    res.status(200).json({ msg: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ msg: "Error al editar usuario" });
  }
};

module.exports = {
  registrar,
  autenticar,
  perfil,
  confirmar,
  comprobarToken,
  olvidePassword,
  nuevoPassword,
  updateUser,
  updateUserPassword,
};

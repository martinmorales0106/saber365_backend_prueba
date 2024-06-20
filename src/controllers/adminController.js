const { Usuario } = require("../db");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const generarId = require("../helpers/generarId");

const crearUsuario = async (req, res) => {
  try {
    const { nombreUsuario, password, colegio, grado, email, admin } = req.body;

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
    const nuevoUsuario = await Usuario.create({
      nombreUsuario,
      email,
      colegio,
      grado,
      password,
      admin,
      confirmado: true,
    });

    // Generar un nuevo token
    const token = generarId();

    // Asignar el token al nuevo usuario
    nuevoUsuario.token = token;
    nuevoUsuario.colegio = colegio.toUpperCase();

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    return res.status(201).json({
      msg: "Usuario creado correctamente.",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    if (usuarios.length === 0) {
      return res.status(404).json({ msg: "No se encontraron usuarios" });
    }
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Aquí eliminamos el usuario
    await usuario.destroy();

    res
      .status(200)
      .json({ msg: "Usuario eliminado con éxito", usuario: usuario });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

const usuariosEliminados = async (req, res) => {
  try {
    const usuariosEliminados = await Usuario.findAll({
      paranoid: false, // Esto ignorará la lógica de eliminación suave
      where: {
        deletedAt: {
          [Op.not]: null, // Filtra usuarios que tienen el campo deletedAt no nulo
        },
      },
    });

    res.json(usuariosEliminados);
  } catch (error) {
    console.error("Error al obtener usuarios eliminados:", error);
    res.status(500).json({ error: "Error al obtener usuarios eliminados" });
  }
};

const recuperarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id, {
      paranoid: false, // Esto ignorará la lógica de eliminación suave (soft delete)
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!usuario.deletedAt) {
      return res
        .status(400)
        .json({ error: "El usuario no está marcado como eliminado" });
    }

    // Aquí recuperamos el usuario cambiando el valor de "deletedAt" a null
    await usuario.restore();

    res.json({ msg: "Usuario recuperado con éxito", usuario });
  } catch (error) {
    console.error("Error al recuperar usuario:", error);
    res.status(500).json({ error: "Error al recuperar usuario" });
  }
};

const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUsuario, email, colegio, grado, admin, password } = req.body;

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

    if (password && password !== usuarioBd.dataValues.password) {
      const salt = await bcrypt.genSalt(10);
      usuarioBd.password =
        (await bcrypt.hash(password, salt)) || usuarioBd.password;
    }

    // Actualizar campos de perfil
    usuarioBd.nombreUsuario = nombreUsuario || usuarioBd.nombreUsuario;
    usuarioBd.email = email || usuarioBd.email;
    usuarioBd.admin = admin || usuarioBd.admin;
    usuarioBd.colegio = colegio.toUpperCase() || usuarioBd.colegio;
    usuarioBd.grado = grado || usuarioBd.grado;

    await usuarioBd.save();

    res
      .status(200)
      .json({ msg: "Usuario actualizado exitosamente", usuario: usuarioBd });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ msg: "Error al editar usuario" });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
  usuariosEliminados,
  recuperarUsuario,
  editarUsuario,
};

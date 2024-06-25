const { Simulacro } = require("../db");
const { Op } = require("sequelize");

const crearSimulacro = async (req, res, next) => {
  try {
    const { titulo } = req.body;

    // Verificar si ya existe un libro con el mismo título
    const simulacroExistente = await Simulacro.findOne({ where: { titulo } });

    if (simulacroExistente) {
      return res.status(400).json({
        msg: "Ya existe un Simulacro con el mismo título",
      });
    }

    const nuevoSimulacro = await Simulacro.create(req.body);

    return res.status(201).json({
      msg: "Usuario creado correctamente.",
      simulacro: nuevoSimulacro,
    });
  } catch (error) {
    console.error("Error al crear el simulacro:", error);
    res.status(500).json({ mensaje: "Hubo un error al procesar la solicitud" });
  }
};

const obtenerSimulacro = async (req, res) => {
  try {
    const simulacros = await Simulacro.findAll();
    res.json(simulacros);
  } catch (error) {
    console.error("Error al obtener simulacro:", error);
    res.status(500).json({ error: "Error al obtener simulacro" });
  }
};

const eliminarSimulacro = async (req, res) => {
  const { id } = req.params;

  try {
    const simulacro = await Simulacro.findByPk(id);

    if (!simulacro) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Aquí eliminamos el simulacro
    await simulacro.destroy();

    res
      .status(200)
      .json({ msg: "Simulacro eliminado con éxito", simulacro: simulacro });
  } catch (error) {
    console.error("Error al eliminar simulacro:", error);
    res.status(500).json({ error: "Error al eliminar simulacro" });
  }
};

const simulacrosEliminados = async (req, res) => {
  try {
    const simulacrosEliminados = await Simulacro.findAll({
      paranoid: false, // Esto ignorará la lógica de eliminación suave
      where: {
        deletedAt: {
          [Op.not]: null, // Filtra usuarios que tienen el campo deletedAt no nulo
        },
      },
    });

    res.json(simulacrosEliminados);
  } catch (error) {
    console.error("Error al obtener simulacros eliminados:", error);
    res.status(500).json({ error: "Error al obtener simulacros eliminados" });
  }
};

const recuperarSimulacro = async (req, res) => {
  const { id } = req.params;

  try {
    const simulacro = await Simulacro.findByPk(id, {
      paranoid: false, // Esto ignorará la lógica de eliminación suave (soft delete)
    });

    if (!simulacro) {
      return res.status(404).json({ error: "Simulacro no encontrado" });
    }

    if (!simulacro.deletedAt) {
      return res
        .status(400)
        .json({ error: "El Simulacro no está marcado como eliminado" });
    }

    // Aquí recuperamos el usuario cambiando el valor de "deletedAt" a null
    await simulacro.restore();

    res.json({ msg: "Simulacro recuperado con éxito", simulacro });
  } catch (error) {
    console.error("Error al recuperar simulacro:", error);
    res.status(500).json({ error: "Error al recuperar simulacro" });
  }
};

const editarSimulacro = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      imagen,
      titulo,
      grado,
      descripcion,
      cantidad_preguntas,
      tiempo,
      numero_sesiones,
      puntaje_maximo,
      precio,
      activo,
    } = req.body;

    const simulacroBd = await Simulacro.findByPk(id, { paranoid: false });

    if (!simulacroBd) {
      return res.status(404).json({ msg: "Simulacro no encontrado" });
    }

    // Verificar si ya existe un usuario con el mismo nombre de usuario

    if (titulo && titulo !== simulacroBd.dataValues.titulo) {
      const existeTitulo = await Simulacro.findOne({
        where: { titulo },
        paranoid: false,
      });

      if (existeTitulo) {
        if (existeTitulo.deletedAt) {
          return res.status(400).json({
            msg: `Titulo ya registrado pero fue eliminado el ${existeTitulo.deletedAt}. Por favor, contacta al administrador para más detalles.`,
          });
        } else {
          return res.status(400).json({
            msg: "Titulo ya registrado. Por favor, elige otro nombre de usuario.",
          });
        }
      }
    }


    // Actualizar campos de perfil
    simulacroBd.imagen = imagen || simulacroBd.imagen;
    simulacroBd.titulo = titulo || simulacroBd.titulo;
    simulacroBd.grado = grado || simulacroBd.grado;
    simulacroBd.descripcion = descripcion || simulacroBd.descripcion;
    simulacroBd.cantidad_preguntas = cantidad_preguntas || simulacroBd.cantidad_preguntas;
    simulacroBd.tiempo = tiempo || simulacroBd.tiempo;
    simulacroBd.numero_sesiones = numero_sesiones || simulacroBd.numero_sesiones;
    simulacroBd.puntaje_maximo = puntaje_maximo || simulacroBd.puntaje_maximo;
    simulacroBd.precio = precio || simulacroBd.precio;
    simulacroBd.activo = activo || simulacroBd.activo;

    await simulacroBd.save();

    res
      .status(200)
      .json({ msg: "Simulacro actualizado exitosamente", simulacro: simulacroBd });
  } catch (error) {
    console.error("Error al editar simulacro:", error);
    res.status(500).json({ msg: "Error al editar simulacro" });
  }
};

module.exports = {
  crearSimulacro,
  obtenerSimulacro,
  eliminarSimulacro,
  simulacrosEliminados,
  recuperarSimulacro,
  editarSimulacro,
};

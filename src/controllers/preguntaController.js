const { Pregunta, Simulacro } = require("../db");
const { Op } = require("sequelize");

const crearPregunta = async (req, res, next) => {
  try {
    const {
      contexto,
      imagen,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      respuesta_correcta,
      afirmacion,
      evidencia,
      justificacion,
      img_Justificacion,
      sesion,
      area,
      grado,
      competencia,
      componente,
      nivel,
      simulacro,
    } = req.body;

    // Busca el simulacro por su título
    const simulacroEncontrado = await Simulacro.findOne({
      where: { titulo: simulacro },
      attributes: ["id"],
    });

    let simulacroId;

    if (simulacroEncontrado) {
      simulacroId = simulacroEncontrado.id;
    } else {
      // Maneja el caso donde el simulacro no se encuentra
      return res.status(404).json({
        msg: "Simulacro no encontrado. Verifica el título del simulacro.",
      });
    }

    // Crear una nueva pregunta
    const nuevaPregunta = await Pregunta.create({
      contexto,
      imagen,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      respuesta_correcta,
      afirmacion,
      evidencia,
      justificacion,
      img_Justificacion,
      sesion,
      area,
      grado,
      competencia,
      componente,
      nivel,
      id_simulacro: Number(simulacroId),
    });

    return res.status(201).json({
      msg: "Pregunta creada correctamente.",
      pregunta: nuevaPregunta,
    });
  } catch (error) {
    console.error("Error al crear la pregunta:", error);
    res.status(500).json({ mensaje: "Hubo un error al procesar la solicitud" });
  }
};

const obtenerPregunta = async (req, res) => {
  try {
    const preguntas = await Pregunta.findAll({
      include: {
        model: Simulacro,
        as: 'simulacro', // Usar el alias definido en la relación
        attributes: ['titulo']
      }
    });

    if (preguntas.length === 0) {
      const error = new Error("No se encontraron preguntas");
      return res.status(401).json({ msg: error.message });
    }
    // Mapear las preguntas para incluir el título del simulacro en lugar de id_simulacro
    const preguntasConTitulo = preguntas.map(pregunta => {
      const preguntaData = pregunta.toJSON();
      preguntaData.titulo_simulacro = preguntaData.simulacro.titulo;
      delete preguntaData.simulacro;
      return preguntaData;
    });

    res.json(preguntasConTitulo);
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    res.status(500).json({ error: "Error al obtener preguntas" });
  }
};

const eliminarPregunta = async (req, res) => {
  const { id } = req.params;

  try {
    const pregunta = await Pregunta.findByPk(id);

    if (!pregunta) {
      return res.status(404).json({ msg: "Pregunta no encontrado" });
    }

    // Aquí eliminamos el simulacro
    await pregunta.destroy();

    res
      .status(200)
      .json({ msg: "Pregunta eliminada con éxito", pregunta: pregunta });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    res.status(500).json({ error: "Error al eliminar pregunta" });
  }
};

const preguntasEliminadas = async (req, res) => {
  try {
    const preguntasEliminadas = await Pregunta.findAll({
      paranoid: false, // Esto ignorará la lógica de eliminación suave
      where: {
        deletedAt: {
          [Op.not]: null, // Filtra usuarios que tienen el campo deletedAt no nulo
        },
      },
    });

    res.json(preguntasEliminadas);
  } catch (error) {
    console.error("Error al obtener preguntas eliminadas:", error);
    res.status(500).json({ error: "Error al obtener preguntas eliminadas" });
  }
};

const recuperarPregunta = async (req, res) => {
  const { id } = req.params;

  try {
    const pregunta = await Pregunta.findByPk(id, {
      paranoid: false, // Esto ignorará la lógica de eliminación suave (soft delete)
    });

    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    if (!pregunta.deletedAt) {
      return res
        .status(400)
        .json({ error: "El pregunta no está marcado como eliminado" });
    }

    // Aquí recuperamos el usuario cambiando el valor de "deletedAt" a null
    await pregunta.restore();

    res.json({ msg: "Pregunta recuperado con éxito", pregunta });
  } catch (error) {
    console.error("Error al recuperar pregunta:", error);
    res.status(500).json({ error: "Error al recuperar pregunta" });
  }
};

const editarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contexto,
      imagen,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      respuesta_correcta,
      afirmacion,
      evidencia,
      justificacion,
      img_Justificacion,
      sesion,
      area,
      grado,
      competencia,
      componente,
      nivel,
      simulacro,
    } = req.body;

    const preguntaBd = await Pregunta.findByPk(id, { paranoid: false });

    if (!preguntaBd) {
      return res.status(404).json({ msg: "Pregunta no encontrado" });
    }

    // Busca el simulacro por su título
    const simulacroEncontrado = await Simulacro.findOne({
      where: { titulo: simulacro },
      attributes: ["id"],
    });

    let simulacroId;

    if (simulacroEncontrado) {
      simulacroId = simulacroEncontrado.id;
    } else {
      // Maneja el caso donde el simulacro no se encuentra
      return res.status(404).json({
        msg: "Simulacro no encontrado. Verifica el título del simulacro.",
      });
    }

    // Actualizar campos de perfil
    preguntaBd.contexto = contexto || preguntaBd.contexto;
    preguntaBd.imagen = imagen || preguntaBd.imagen;
    preguntaBd.pregunta = pregunta || preguntaBd.pregunta;
    preguntaBd.opcionA = opcionA || preguntaBd.opcionA;
    preguntaBd.opcionB = opcionB || preguntaBd.opcionB;
    preguntaBd.opcionC = opcionC || preguntaBd.opcionC;
    preguntaBd.opcionD = opcionD || preguntaBd.opcionD;
    preguntaBd.respuesta_correcta =
      respuesta_correcta || preguntaBd.respuesta_correcta;
    preguntaBd.afirmacion = afirmacion || preguntaBd.afirmacion;
    preguntaBd.evidencia = evidencia || preguntaBd.evidencia;
    preguntaBd.justificacion = justificacion || preguntaBd.justificacion;
    preguntaBd.img_Justificacion =
      img_Justificacion || preguntaBd.img_Justificacion;
    preguntaBd.sesion = sesion || preguntaBd.sesion;
    preguntaBd.area = area || preguntaBd.area;
    preguntaBd.grado = grado || preguntaBd.grado;
    preguntaBd.competencia = competencia || preguntaBd.competencia;
    preguntaBd.componente = componente || preguntaBd.componente;
    preguntaBd.nivel = nivel || preguntaBd.nivel;
    preguntaBd.id_simulacro = Number(simulacroId) || preguntaBd.id_simulacro;

    await preguntaBd.save();

    res
      .status(200)
      .json({
        msg: "Pregunta actualizada exitosamente",
        pregunta: preguntaBd,
      });
  } catch (error) {
    console.error("Error al editar pregunta:", error);
    res.status(500).json({ msg: "Error al editar pregunta" });
  }
};

module.exports = {
  crearPregunta,
  obtenerPregunta,
  eliminarPregunta,
  preguntasEliminadas,
  recuperarPregunta,
  editarPregunta,
};

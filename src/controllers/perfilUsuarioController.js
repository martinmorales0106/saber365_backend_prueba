const { Simulacro, Pregunta } = require("../db");

const obtenerSimulacrosUsuario = async (req, res) => {
  try {
    const simulacros = await Simulacro.findAll();
    res.status(200).json(simulacros);
  } catch (error) {
    console.error("Error al obtener simulacros:", error);
    res.status(500).json({ error: "Error al obtener simulacros" });
  }
};

const obtenerPreguntasUsuario = async (req, res) => {
  try {
    const preguntas = await Pregunta.findAll({
      include: {
        model: Simulacro,
        as: 'simulacro', // Usar el alias definido en la relación
        attributes: ['titulo']
      }
    });

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


module.exports = {
  obtenerSimulacrosUsuario,
};

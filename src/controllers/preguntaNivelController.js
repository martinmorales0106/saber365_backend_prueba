const { PreguntaNivel } = require("../db");

const crearPreguntaNivel = async (req, res, next) => {
  try {
    const {
      titulo_texto,
      contexto,
      pie_texto,
      imagen,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      opcionE,
      opcionF,
      opcionG,
      opcionH,
      respuesta_correcta,
      afirmacion,
      evidencia,
      justificacion,
      opcion_invalida,
      img_Justificacion,
      img_opcion_invalida,
      area,
      grado,
      competencia,
      componente,
      nivel,
      parte,
      tema,
      sub_tema,
      enlace,
      utilizadaDesafio,
      utilizadaSimulacro,
    } = req.body;

    console.log(PreguntaNivel);
    

    const nuevaPreguntaNivel = await PreguntaNivel.create({
      titulo_texto,
      contexto,
      pie_texto,
      imagen,
      pregunta,
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      opcionE,
      opcionF,
      opcionG,
      opcionH,
      respuesta_correcta,
      afirmacion,
      evidencia,
      justificacion,
      opcion_invalida,
      img_Justificacion,
      img_opcion_invalida,
      area,
      grado,
      competencia,
      componente,
      nivel,
      parte,
      tema,
      sub_tema,
      enlace,
      utilizadaDesafio,
      utilizadaSimulacro,
    });

    return res.status(201).json({
      msg: "PreguntaNivel creada correctamente.",
      preguntaNivel: nuevaPreguntaNivel,
    });
  } catch (error) {
    console.error("Error al crear la PreguntaNivel:", error);
    res.status(500).json({ mensaje: "Hubo un error al procesar la solicitud" });
  }
};

// Función para obtener todas las preguntas de nivel
const obtenerPreguntasNivel = async (req, res) => {
  try {
    const preguntas = await PreguntaNivel.findAll();

    // Puedes hacer transformaciones aquí si necesitas modificar los datos antes de enviarlos
    const preguntasFormateadas = preguntas.map((pregunta) => pregunta.toJSON());

    res.json(preguntasFormateadas);
  } catch (error) {
    console.error("Error al obtener preguntasNivel:", error);
    res.status(500).json({ error: "Error al obtener preguntasNivel" });
  }
};


module.exports = {
  crearPreguntaNivel,
  obtenerPreguntasNivel,
};

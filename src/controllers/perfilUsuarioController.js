const { Simulacro, Pregunta, SimulacroRealizado, SimulacroFinalizado, Usuario } = require("../db");

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
        as: "simulacro", // Usar el alias definido en la relación
        attributes: ["titulo"],
      },
    });

    // Mapear las preguntas para incluir el título del simulacro en lugar de id_simulacro
    const preguntasConTitulo = preguntas.map((pregunta) => {
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

const simulacroRealizado = async (req, res) => {
  try {
    const {
      id_usuario,
      id_simulacro,
      numero_sesion,
      estado_preguntas_sesion1,
      estado_preguntas_sesion2,
      tiempo_prueba_sesion1,
      tiempo_prueba_sesion2,
    } = req.body;

    const estado_preguntas1_json = JSON.stringify(estado_preguntas_sesion1);
    const estado_preguntas2_json = JSON.stringify(estado_preguntas_sesion2);

    // Buscar si ya existe un registro con las mismas claves primarias
    const existingRecord = await SimulacroRealizado.findOne({
      where: { id_usuario, id_simulacro },
    });

    if (existingRecord) {
      // Verificar y actualizar los campos que no sean nulos
      const updatedFields = {};

      if (estado_preguntas_sesion1 !== null) {
        updatedFields.estado_preguntas_sesion1 = estado_preguntas1_json;
      }
      if (estado_preguntas_sesion2 !== null) {
        updatedFields.estado_preguntas_sesion2 = estado_preguntas2_json;
      }
      if (tiempo_prueba_sesion1 !== null) {
        updatedFields.tiempo_prueba_sesion1 = tiempo_prueba_sesion1;
      }
      if (tiempo_prueba_sesion2 !== null) {
        updatedFields.tiempo_prueba_sesion2 = tiempo_prueba_sesion2;
      }

      // Actualizar solo los campos que se han verificado
      await existingRecord.update(updatedFields);
    } else {
      // Si no existe, insertar un nuevo registro
      await SimulacroRealizado.create({
        id_usuario,
        id_simulacro,
        numero_sesion,
        estado_preguntas_sesion1: estado_preguntas1_json,
        estado_preguntas_sesion2: estado_preguntas2_json,
        tiempo_prueba_sesion1,
        tiempo_prueba_sesion2,
      });
    }

    // Verificar si sesion_completada debe ser true
    let sesionCompletada = false;
    if (numero_sesion === "1") {
      sesionCompletada = true;
    } else {
      const sesion1Llena = await verificarCamposLlenosEnBD(
        id_usuario,
        id_simulacro,
        "estado_preguntas_sesion1"
      );
      const sesion2Llena = await verificarCamposLlenosEnBD(
        id_usuario,
        id_simulacro,
        "estado_preguntas_sesion2"
      );

      if (sesion1Llena && sesion2Llena) {
        sesionCompletada = true;
      }
    }

    if (sesionCompletada) {
      await SimulacroRealizado.update(
        { sesion_completada: true },
        { where: { id_usuario, id_simulacro } }
      );
    }

    // Obtener el registro actualizado
    const registroActualizado = await SimulacroRealizado.findOne({
      where: { id_usuario, id_simulacro },
    });

    // Convertir las cadenas JSON de vuelta a objetos antes de enviarlas en la respuesta
    registroActualizado.estado_preguntas_sesion1 = JSON.parse(registroActualizado.estado_preguntas_sesion1);
    registroActualizado.estado_preguntas_sesion2 = JSON.parse(registroActualizado.estado_preguntas_sesion2);
    
    res.json(registroActualizado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

async function verificarCamposLlenosEnBD(id_usuario, id_simulacro, campo) {
  try {
    const resultado = await SimulacroRealizado.findOne({
      where: { id_usuario, id_simulacro },
      attributes: [campo],
    });

    return resultado && resultado[campo] !== null;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const simulacroFinalizado = async (req, res) => {
  try {
    const {
      id_usuario,
      id_simulacro,
      estado_preguntas,
      puntaje_global,
      nivel_alcanzado,
      puntaje_por_area,
      nivel_por_area,
      tiempo_prueba,
    } = req.body;

      // Verificar si ya existe un registro con id_usuario e id_simulacro dados
      const existingRegistro = await SimulacroFinalizado.findOne({
        where: {
          id_usuario,
          id_simulacro,
        },
      });
  
      if (existingRegistro) {
        return res.status(201).json({
          msg: "El usuario ya ha realizado este simulacro.",
        });
      }

    // Crear el registro utilizando Sequelize
    const nuevoRegistro = await SimulacroFinalizado.create({
      id_usuario,
      id_simulacro,
      estado_preguntas: JSON.stringify(estado_preguntas),
      puntaje_global,
      nivel_alcanzado,
      puntaje_por_area: JSON.stringify(puntaje_por_area),
      nivel_por_area: JSON.stringify(nivel_por_area),
      tiempo_prueba,
    });

    // Convertir las cadenas JSON de vuelta a objetos antes de enviarlas en la respuesta
    nuevoRegistro.estado_preguntas = JSON.parse(nuevoRegistro.estado_preguntas);
    nuevoRegistro.puntaje_por_area = JSON.parse(nuevoRegistro.puntaje_por_area);
    nuevoRegistro.nivel_por_area = JSON.parse(nuevoRegistro.nivel_por_area);
    res.status(201).json({
      msg: "Prueba guardada correctamente.",
      nuevoRegistro,
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({
      msg: "Error en el servidor para insertar en la tabla usuarios_simulacros_realizados",
    });
  }
};

const obtenerResultadoSimulacro = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtén la información del simulacro realizado por su ID utilizando Sequelize
    const resultadoSimulacro = await SimulacroFinalizado.findOne({
      where: { id },
      include: [
        { model: Usuario, as: 'usuario' }, // Incluir datos del usuario con alias 'usuario'
        { model: Simulacro, as: 'simulacro' }, // Incluir datos del simulacro con alias 'simulacro'
      ],
    });

    if (!resultadoSimulacro) {
      return res.status(404).json({
        msg: "No se encontró ningún resultado de simulacro con el ID proporcionado.",
      });
    }

    resultadoSimulacro.estado_preguntas = JSON.parse(resultadoSimulacro.estado_preguntas);
    resultadoSimulacro.puntaje_por_area = JSON.parse(resultadoSimulacro.puntaje_por_area);
    resultadoSimulacro.nivel_por_area = JSON.parse(resultadoSimulacro.nivel_por_area);

    res.status(200).json({
      resultadoSimulacro,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error en el servidor al obtener resultados del simulacro.",
    });
  }
};

const obtenerSimulacroRealizado = async (req, res) => {
  const { id } = req.params;

  try {
    const simulacroRealizado = await SimulacroRealizado.findOne({
      where: { id },
    });
    if (!simulacroRealizado) {
      return res.status(404).json({
        msg: "No se encontró ningún resultado de simulacro con el ID proporcionado.",
      });
    }

    simulacroRealizado.estado_preguntas_sesion1 = JSON.parse(simulacroRealizado.estado_preguntas_sesion1);
    simulacroRealizado.estado_preguntas_sesion2 = JSON.parse(simulacroRealizado.estado_preguntas_sesion2);
    
    res.status(200).json(simulacroRealizado);
  } catch (error) {
    console.error("Error al obtener simulacros:", error);
    res.status(500).json({ error: "Error al obtener simulacros" });
  }
}
module.exports = {
  obtenerSimulacrosUsuario,
  obtenerPreguntasUsuario,
  simulacroRealizado,
  simulacroFinalizado,
  obtenerResultadoSimulacro,
  obtenerSimulacroRealizado,
};

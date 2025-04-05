const {
  Simulacro,
  Pregunta,
  SimulacroRealizado,
  SimulacroFinalizado,
  Usuario,
} = require("../db");
const { Op, fn, col } = require("sequelize");
const bcrypt = require("bcrypt");

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
      include: {
        model: Simulacro,
        as: "simulacro", // Usar el alias definido en la relación
        attributes: ["titulo"],
      },
      where: { id_usuario, id_simulacro },
    });

    // Convertir las cadenas JSON de vuelta a objetos antes de enviarlas en la respuesta
    registroActualizado.estado_preguntas_sesion1 = JSON.parse(
      registroActualizado.estado_preguntas_sesion1
    );
    registroActualizado.estado_preguntas_sesion2 = JSON.parse(
      registroActualizado.estado_preguntas_sesion2
    );

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
        { model: Usuario, as: "usuario" }, // Incluir datos del usuario con alias 'usuario'
        { model: Simulacro, as: "simulacro" }, // Incluir datos del simulacro con alias 'simulacro'
      ],
    });

    if (!resultadoSimulacro) {
      return res.status(404).json({
        msg: "No se encontró ningún resultado de simulacro con el ID proporcionado.",
      });
    }

    resultadoSimulacro.estado_preguntas = JSON.parse(
      resultadoSimulacro.estado_preguntas
    );
    resultadoSimulacro.puntaje_por_area = JSON.parse(
      resultadoSimulacro.puntaje_por_area
    );
    resultadoSimulacro.nivel_por_area = JSON.parse(
      resultadoSimulacro.nivel_por_area
    );

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
      include: {
        model: Simulacro,
        as: "simulacro", // Usar el alias definido en la relación
        attributes: ["titulo"],
      },
      where: { id },
    });
    if (!simulacroRealizado) {
      return res.status(404).json({
        msg: "No se encontró ningún resultado de simulacro con el ID proporcionado.",
      });
    }

    simulacroRealizado.estado_preguntas_sesion1 = JSON.parse(
      simulacroRealizado.estado_preguntas_sesion1
    );
    simulacroRealizado.estado_preguntas_sesion2 = JSON.parse(
      simulacroRealizado.estado_preguntas_sesion2
    );

    res.status(200).json(simulacroRealizado);
  } catch (error) {
    console.error("Error al obtener simulacros:", error);
    res.status(500).json({ error: "Error al obtener simulacros" });
  }
};

const obtenerSimulacrosFinalizados = async (req, res) => {
  const { id } = req.params;

  try {
    const simulacrosRealizados = await SimulacroFinalizado.findAll({
      where: { id_usuario: id },
      include: [
        { model: Usuario, as: "usuario" }, // Incluir datos del usuario con alias 'usuario'
        { model: Simulacro, as: "simulacro" }, // Incluir datos del simulacro con alias 'simulacro'
      ],
    });
    if (!simulacrosRealizados || simulacrosRealizados.length === 0) {
      return res.status(201).json({
        msg: "No se encontró ningún resultado de simulacro con el ID proporcionado.",
      });
    }

    simulacrosRealizados.forEach((simulacro) => {
      simulacro.estado_preguntas = JSON.parse(simulacro.estado_preguntas);
      simulacro.puntaje_por_area = JSON.parse(simulacro.puntaje_por_area);
      simulacro.nivel_por_area = JSON.parse(simulacro.nivel_por_area);
    });

    res.status(200).json(simulacrosRealizados);
  } catch (error) {
    console.error("Error al obtener simulacros:", error);
    res.status(500).json({ error: "Error al obtener simulacros" });
  }
};

// Obtener posición del usuario según puntaje global en un simulacro específico
const obtenerPosicionUsuarioPorPuntajeGlobal = async (req, res) => {
  const { simulacroId, usuarioId } = req.params;

  try {
    // Obtener el puntaje global y tiempo de prueba del usuario en el simulacro específico
    const { puntaje_global, tiempo_prueba } = await SimulacroFinalizado.findOne(
      {
        where: {
          id_simulacro: simulacroId,
          id_usuario: usuarioId,
        },
        attributes: ["puntaje_global", "tiempo_prueba"],
      }
    );

    // Obtener todos los simulacros finalizados para el simulacro actual
    const todosSimulacrosFinalizados = await SimulacroFinalizado.findAll({
      where: {
        id_simulacro: simulacroId,
      },
      attributes: ["puntaje_global", "tiempo_prueba"],
    });

    // Ordenar los puntajes globales de mayor a menor, y en caso de empate, ordenar por tiempo de prueba de menor a mayor
    const puntajesOrdenados = todosSimulacrosFinalizados.sort((a, b) => {
      if (a.puntaje_global === b.puntaje_global) {
        return b.tiempo_prueba - a.tiempo_prueba;
      }
      return b.puntaje_global - a.puntaje_global;
    });

    // Encontrar la posición del usuario en la lista ordenada
    const posicionUsuario =
      puntajesOrdenados.findIndex(
        (item) =>
          item.puntaje_global === puntaje_global &&
          item.tiempo_prueba === tiempo_prueba
      ) + 1;

    // Devolver la posición del usuario
    res.status(200).json({ posicion: posicionUsuario });
  } catch (error) {
    console.error("Error al obtener posición del usuario:", error);
    res.status(500).json({ error: "Error al obtener posición del usuario" });
  }
};

// Obtener posición del usuario por área para todas las áreas en un simulacro específico
const obtenerPosicionesUsuarioPorAreas = async (req, res) => {
  const { simulacroId, usuarioId } = req.params;

  try {
    // Obtener el puntaje por área del usuario en el simulacro específico
    const simulacroFinalizado = await SimulacroFinalizado.findOne({
      where: {
        id_simulacro: simulacroId,
        id_usuario: usuarioId,
      },
      attributes: ["puntaje_por_area", "tiempo_prueba"],
    });

    // Validar que el simulacro finalizado exista y tenga puntajes por área
    if (!simulacroFinalizado || !simulacroFinalizado.puntaje_por_area) {
      return res.status(404).json({
        error:
          "No se encontró el simulacro finalizado o no hay puntajes por área.",
      });
    }

    // Obtener el objeto de puntajes por área del usuario
    const puntajesPorArea = JSON.parse(simulacroFinalizado.puntaje_por_area);
    const tiempoPrueba = simulacroFinalizado.tiempo_prueba;

    // Obtener todos los simulacros finalizados para el simulacro actual
    const todosSimulacrosFinalizados = await SimulacroFinalizado.findAll({
      where: {
        id_simulacro: simulacroId,
      },
      attributes: ["id_usuario", "puntaje_por_area", "tiempo_prueba"],
    });

    // Objeto para almacenar las posiciones por área con nombres de área
    const posicionesPorArea = {};

    // Definir nombres de las áreas que se esperan
    const nombresAreas = [
      "Matemáticas",
      "Lectura Crítica",
      "Sociales",
      "Naturales",
      "Inglés",
      "Lenguaje",
      "C. Ciudadanas",
    ];

    // Iterar sobre cada área y obtener la posición del usuario en esa área
    for (const area of nombresAreas) {
      // Obtener los puntajes y tiempos de prueba de todos los usuarios en el área actual
      const puntajesArea = todosSimulacrosFinalizados.map((simulacro) => {
        const puntajesPorAreaUsuario = JSON.parse(simulacro.puntaje_por_area);
        return {
          puntaje: puntajesPorAreaUsuario[area] || 0,
          tiempo: simulacro.tiempo_prueba,
        };
      });

      // Ordenar los puntajes de mayor a menor, y en caso de empate, ordenar por tiempo de prueba de menor a mayor
      puntajesArea.sort((a, b) => {
        if (a.puntaje === b.puntaje) {
          return b.tiempo - a.tiempo;
        }
        return b.puntaje - a.puntaje;
      });

      // Encontrar la posición del usuario en el área actual
      const posicionUsuario =
        puntajesArea.findIndex(
          (item) =>
            item.puntaje === puntajesPorArea[area] &&
            item.tiempo === tiempoPrueba
        ) + 1;

      // Asignar la posición al objeto de posiciones por área
      posicionesPorArea[area] = posicionUsuario;
    }

    // Devolver el objeto JSON con las posiciones por área con nombres de área
    res.status(200).json(posicionesPorArea);
  } catch (error) {
    console.error("Error al obtener posiciones del usuario por áreas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener posiciones del usuario por áreas" });
  }
};

const obtenerMejoresPuntajes = async (req, res) => {
  try {
    const { usuarioId, gradoUsuario } = req.params;

    // Consultar los 10 mayores puntajes globales de simulacros del mismo grado que el usuario
    const [mejoresPuntajesGlobales, mayorPuntajeUsuario] = await Promise.all([
      SimulacroFinalizado.findAll({
        attributes: [
          "id_usuario",
          "puntaje_global",
          "id_simulacro",
          "tiempo_prueba",
        ],
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombreUsuario", "grado"],
          },
          {
            model: Simulacro,
            as: "simulacro",
            attributes: ["grado", "titulo", "tiempo"],
            where: { grado: gradoUsuario },
          },
        ],
        order: [
          ["puntaje_global", "DESC"],
          ["tiempo_prueba", "DESC"],
        ],
        limit: 10,
      }),
      SimulacroFinalizado.findOne({
        attributes: [
          "id_usuario",
          "puntaje_global",
          "id_simulacro",
          "tiempo_prueba",
        ],
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombreUsuario", "grado"],
          },
          {
            model: Simulacro,
            as: "simulacro",
            attributes: ["grado", "titulo", "tiempo"],
            where: { grado: gradoUsuario },
          },
        ],
        where: { id_usuario: usuarioId },
        order: [
          ["puntaje_global", "DESC"],
          ["tiempo_prueba", "DESC"],
        ],
      }),
    ]);

    // Consultar la posición del puntaje del usuario si existe
    let posicion = null;
    if (mayorPuntajeUsuario) {
      posicion = await SimulacroFinalizado.count({
        where: {
          puntaje_global: { [Op.gt]: mayorPuntajeUsuario.puntaje_global },
          "$simulacro.grado$": gradoUsuario,
        },
        include: [
          {
            model: Simulacro,
            as: "simulacro",
            attributes: [],
          },
        ],
      });
    }

    // Mapear los resultados para ajustar el formato de respuesta
    const resultadosFormateados = {
      mejoresPuntajesGlobales: mejoresPuntajesGlobales.map((item) => ({
        id_usuario: item.id_usuario,
        puntaje_global: item.puntaje_global,
        tiempo_prueba: item.tiempo_prueba,
        id_simulacro: item.id_simulacro,
        titulo: item.simulacro.titulo,
        tiempo: item.simulacro.tiempo,
        nombreUsuario: item.usuario.nombreUsuario,
        grado: item.usuario.grado,
      })),
      mayorPuntajeUsuario: mayorPuntajeUsuario
        ? {
            id_usuario: mayorPuntajeUsuario.id_usuario,
            puntaje_global: mayorPuntajeUsuario.puntaje_global,
            tiempo_prueba: mayorPuntajeUsuario.tiempo_prueba,
            id_simulacro: mayorPuntajeUsuario.id_simulacro,
            titulo: mayorPuntajeUsuario.simulacro.titulo,
            tiempo: mayorPuntajeUsuario.simulacro.tiempo,
            nombreUsuario: mayorPuntajeUsuario.usuario.nombreUsuario,
            grado: mayorPuntajeUsuario.usuario.grado,
            posicion: posicion + 1, // Ajustar a una base de 1 en lugar de 0
          }
        : null,
    };

    // Devolver resultados
    res.status(200).json(resultadosFormateados);
  } catch (error) {
    console.error("Error al obtener los mejores puntajes globales:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los mejores puntajes globales" });
  }
};

const obtenerMejoresPuntajesPorArea = async (req, res) => {
  try {
    const { usuarioId, gradoUsuario } = req.params;

    const areas = [
      "Matemáticas",
      "Lectura Crítica",
      "Sociales",
      "Naturales",
      "Inglés",
      "Lenguaje",
      "C. Ciudadanas",
    ];

    // Consultar todos los registros de simulacros finalizados del mismo grado que el usuario
    const simulacrosFinalizados = await SimulacroFinalizado.findAll({
      attributes: [
        "id_usuario",
        "id_simulacro",
        "tiempo_prueba",
        "puntaje_por_area",
      ],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombreUsuario", "grado"],
        },
        {
          model: Simulacro,
          as: "simulacro",
          attributes: ["grado", "titulo", "tiempo"],
          where: { grado: gradoUsuario },
        },
      ],
    });

    // Procesar los datos en JavaScript para cada área
    const resultadosPorArea = {};

    areas.forEach((area) => {
      // Filtrar simulacros finalizados por área y ordenar por puntaje_area y tiempo_prueba
      const simulacrosFiltrados = simulacrosFinalizados
        .filter((item) => {
          const puntajes = JSON.parse(item.puntaje_por_area);
          return puntajes.hasOwnProperty(area); // Verificar si el área está presente en puntaje_por_area
        })
        .map((item) => ({
          id_usuario: item.id_usuario,
          puntaje_area: JSON.parse(item.puntaje_por_area)[area],
          tiempo_prueba: item.tiempo_prueba,
          id_simulacro: item.id_simulacro,
          titulo: item.simulacro.titulo,
          tiempo: item.simulacro.tiempo,
          nombreUsuario: item.usuario.nombreUsuario,
          grado: item.usuario.grado,
          area: area,
        }))
        .sort(
          (a, b) =>
            b.puntaje_area - a.puntaje_area || b.tiempo_prueba - a.tiempo_prueba
        );

      // Obtener los mejores puntajes por área (los dos primeros registros)
      const mejoresPuntajesPorArea = simulacrosFiltrados.slice(0, 5);

      // Obtener el mayor puntaje del usuario para el área específica
      const puntajesUsuario = simulacrosFiltrados.filter(
        (item) => item.id_usuario == usuarioId
      );
      const mayorPuntajeUsuario =
        puntajesUsuario.length > 0 ? puntajesUsuario[0] : null;

      // Obtener la posición del usuario en el ranking de puntajes por área
      const posicion =
        simulacrosFiltrados.findIndex((item) => item.id_usuario == usuarioId) +
        1;

      // Almacenar resultados por área
      resultadosPorArea[area] = {
        mejoresPuntajesPorArea: mejoresPuntajesPorArea,
        mayorPuntajeUsuario: mayorPuntajeUsuario
          ? { ...mayorPuntajeUsuario, posicion: posicion }
          : null,
      };
    });

    // Devolver resultados
    res.status(200).json(resultadosPorArea);
  } catch (error) {
    console.error("Error al obtener los mejores puntajes por área:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los mejores puntajes por área" });
  }
};

const obtenerMejorPuntajePorSimulacro = async (req, res) => {
  try {
    const { gradoSimulacro } = req.params;

    // Consultar los mayores puntajes globales por simulacro del mismo grado
    const mejoresPuntajesPorSimulacro = await SimulacroFinalizado.findAll({
      attributes: [
        "id_simulacro",
        [fn("max", col("puntaje_global")), "max_puntaje_global"],
      ],
      include: [
        {
          model: Simulacro,
          as: "simulacro",
          attributes: ["id", "titulo", "grado"],
          where: { grado: gradoSimulacro },
        },
      ],
      group: [
        "SimulacroFinalizado.id_simulacro",
        "simulacro.id",
        "simulacro.titulo",
        "simulacro.grado",
      ],
    });

    // Mapear los resultados para ajustar el formato de respuesta
    const resultadosFormateados = await Promise.all(
      mejoresPuntajesPorSimulacro.map(async (item) => {
        // Obtener el tiempo de prueba del simulacro finalizado
        const simulacroFinalizado = await SimulacroFinalizado.findOne({
          where: {
            id_simulacro: item.id_simulacro,
            puntaje_global: item.dataValues.max_puntaje_global,
          },
          attributes: ["tiempo_prueba"],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombreUsuario"],
            },
          ],
        });

        return {
          id_simulacro: item.id_simulacro,
          max_puntaje_global: item.dataValues.max_puntaje_global,
          tiempo_prueba: simulacroFinalizado
            ? simulacroFinalizado.tiempo_prueba
            : null,
          titulo: item.simulacro.titulo,
          grado: gradoSimulacro, // Aquí usamos gradoSimulacro pasado como parámetro
          nombreUsuario: simulacroFinalizado
            ? simulacroFinalizado.usuario.nombreUsuario
            : null,
          id_usuario: simulacroFinalizado
            ? simulacroFinalizado.usuario.id
            : null,
        };
      })
    );

    // Devolver resultados
    res.status(200).json(resultadosFormateados);
  } catch (error) {
    console.error(
      "Error al obtener los mejores puntajes globales por simulacro:",
      error
    );
    res.status(500).json({
      error: "Error al obtener los mejores puntajes globales por simulacro",
    });
  }
};

const obtenerTodosSimulacrosRealizados = async (req, res) => {
  try {
    const simulacrosRealizados = await SimulacroRealizado.findAll();

    if (!simulacrosRealizados || simulacrosRealizados.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron resultados de simulacros realizados.",
      });
    }

    // Parsear JSON en cada simulacro realizado
    const simulacrosParseados = simulacrosRealizados.map((simulacro) => {
      simulacro.estado_preguntas_sesion1 = JSON.parse(
        simulacro.estado_preguntas_sesion1
      );
      simulacro.estado_preguntas_sesion2 = JSON.parse(
        simulacro.estado_preguntas_sesion2
      );
      return simulacro;
    });

    res.status(200).json(simulacrosParseados);
  } catch (error) {
    console.error("Error al obtener simulacros realizados:", error);
    res.status(500).json({ error: "Error al obtener simulacros realizados" });
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
    usuarioBd.colegio = colegio.toUpperCase() || usuarioBd.colegio;
    usuarioBd.grado = grado || usuarioBd.grado;
    usuarioBd.nombres = nombres || usuarioBd.nombres;
    usuarioBd.apellidos = apellidos || usuarioBd.apellidos;
    usuarioBd.departamento = departamento || usuarioBd.departamento;
    usuarioBd.municipio = municipio || usuarioBd.municipio;

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
      admin: usuarioBd.admin
    };

    res.status(200).json({ msg: "Usuario actualizado exitosamente", usuario: usuarioActualizado });

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
  obtenerSimulacrosUsuario,
  obtenerPreguntasUsuario,
  simulacroRealizado,
  simulacroFinalizado,
  obtenerResultadoSimulacro,
  obtenerSimulacroRealizado,
  obtenerSimulacrosFinalizados,
  obtenerPosicionUsuarioPorPuntajeGlobal,
  obtenerPosicionesUsuarioPorAreas,
  obtenerMejoresPuntajes,
  obtenerMejoresPuntajesPorArea,
  obtenerMejorPuntajePorSimulacro,
  obtenerTodosSimulacrosRealizados,
  updateUser,
  updateUserPassword,
};

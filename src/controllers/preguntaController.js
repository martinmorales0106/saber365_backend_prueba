const { Pregunta, Simulacro, SimulacroPregunta } = require("../db");
const { Op } = require("sequelize");

// --- CREAR PREGUNTA (Adaptado a JSONB y Relaciones) ---
const crearPregunta = async (req, res) => {
  try {
    const {
      // Campos académicos
      grado,
      area,
      nivel_dificultad,
      competencia,
      componente,
      tema,
      sub_tema,
      
      // Contenido visual/texto
      contexto,
      imagen,
      titulo_texto,
      pie_texto,
      pregunta, // En el frontend se llama 'pregunta', en DB 'texto_pregunta'
      
      // Opciones (Frontend envía A, B, C...)
      opcionA,
      opcionB,
      opcionC,
      opcionD,
      opcionE,
      opcionF,
      opcionG,
      opcionH,
      respuesta_correcta, // Ej: "A" o "B"

      // Retroalimentación
      afirmacion,
      evidencia,
      justificacion,
      img_Justificacion,
      opcion_invalida,
      img_opcion_invalida,
      enlace,

      // Datos de asignación (Lo que antes iba directo en la tabla)
      simulacro, // Título del simulacro
      sesion,    // "1" o "2" (Ahora va a la tabla intermedia)
      numero,    // Orden de la pregunta (Ahora va a la tabla intermedia)
      
      // Flags
      es_premium
    } = req.body;

    // 1. CONSTRUCCIÓN DEL JSON DE OPCIONES
    // Convertimos las columnas sueltas en un array estructurado
    let opcionesArray = [];
    
    // Función auxiliar para agregar opciones
    const agregarOpcion = (letra, texto) => {
      if (texto) {
        opcionesArray.push({
          id: letra,
          texto: texto,
          esCorrecta: respuesta_correcta === letra // Marcamos true si es la correcta
        });
      }
    };

    agregarOpcion("A", opcionA);
    agregarOpcion("B", opcionB);
    agregarOpcion("C", opcionC);
    agregarOpcion("D", opcionD);
    agregarOpcion("E", opcionE);
    agregarOpcion("F", opcionF);
    agregarOpcion("G", opcionG);
    agregarOpcion("H", opcionH);

    // 2. CREAR LA PREGUNTA EN EL BANCO
    const nuevaPregunta = await Pregunta.create({
      grado,
      area,
      nivel_dificultad: nivel_dificultad || 1,
      titulo_texto,
      contexto,
      pie_texto,
      imagen,
      texto_pregunta: pregunta, // Mapeo clave: req.body.pregunta -> DB.texto_pregunta
      opciones: opcionesArray,   // Guardamos el JSON procesado
      afirmacion,
      evidencia,
      justificacion,
      img_Justificacion,
      opcion_invalida,
      img_opcion_invalida,
      competencia,
      componente,
      tema,
      sub_tema,
      enlace,
      es_publica: !es_premium, // Si es premium, no es pública
      es_premium: es_premium || false,
    });

    // 3. ASOCIAR AL SIMULACRO (Si se envió un título de simulacro)
    if (simulacro) {
      const simulacroEncontrado = await Simulacro.findOne({
        where: { titulo: simulacro },
      });

      if (simulacroEncontrado) {
        // Usamos la tabla intermedia (SimulacroPregunta) para guardar sesión y orden
        // Nota: Asegúrate de que en db.js la relación sea Simulacro.belongsToMany
        await simulacroEncontrado.addPregunta(nuevaPregunta, {
          through: {
            sesion_asignada: parseInt(sesion) || 1, 
            orden: parseInt(numero) || 0,
            valor_pregunta: 2 // Valor por defecto
          }
        });
      }
    }

    return res.status(201).json({
      msg: "Pregunta creada y añadida al banco correctamente.",
      pregunta: nuevaPregunta,
    });

  } catch (error) {
    console.error("Error al crear la pregunta:", error);
    res.status(500).json({ mensaje: "Hubo un error al procesar la solicitud" });
  }
};

// --- OBTENER PREGUNTAS ---
const obtenerPregunta = async (req, res) => {
  try {
    // Buscamos preguntas e incluimos en qué simulacros aparecen
    const preguntas = await Pregunta.findAll({
      include: {
        model: Simulacro,
        as: "simulacros", // Asegúrate que este alias coincida con tu db.js (belongsToMany)
        attributes: ["titulo", "grado"],
        through: {
          attributes: ["sesion_asignada", "orden"] // Traemos datos de la tabla intermedia
        }
      },
      order: [['id', 'DESC']] // Las más nuevas primero
    });

    // Mapeo opcional: Si tu frontend viejo espera "opcionA", "opcionB" sueltas,
    // puedes transformarlas aquí antes de responder.
    const preguntasFormateadas = preguntas.map(p => {
      const data = p.toJSON();
      
      // Extraemos la respuesta correcta del JSON para enviarla fácil al front
      const opcionCorrectaObj = data.opciones.find(op => op.esCorrecta === true);
      
      return {
        ...data,
        pregunta: data.texto_pregunta, // Devolvemos nombre compatible con front
        respuesta_correcta: opcionCorrectaObj ? opcionCorrectaObj.id : null,
        // Si necesitas compatibilidad con campos viejos:
        opcionA: data.opciones.find(o => o.id === 'A')?.texto || "",
        opcionB: data.opciones.find(o => o.id === 'B')?.texto || "",
        opcionC: data.opciones.find(o => o.id === 'C')?.texto || "",
        opcionD: data.opciones.find(o => o.id === 'D')?.texto || "",
        // Incluimos info del primer simulacro asociado (para compatibilidad visual)
        titulo_simulacro: data.simulacros.length > 0 ? data.simulacros[0].titulo : "Banco General"
      };
    });

    res.json(preguntasFormateadas);
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    res.status(500).json({ error: "Error al obtener preguntas" });
  }
};

// --- ELIMINAR PREGUNTA ---
const eliminarPregunta = async (req, res) => {
  const { id } = req.params;

  try {
    const pregunta = await Pregunta.findByPk(id);

    if (!pregunta) {
      return res.status(404).json({ msg: "Pregunta no encontrada" });
    }

    await pregunta.destroy();

    res.status(200).json({ msg: "Pregunta eliminada con éxito", pregunta });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    res.status(500).json({ error: "Error al eliminar pregunta" });
  }
};

// --- RECUPERAR PREGUNTA ---
const recuperarPregunta = async (req, res) => {
  const { id } = req.params;

  try {
    const pregunta = await Pregunta.findByPk(id, { paranoid: false });

    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });
    
    if (!pregunta.deletedAt) {
      return res.status(400).json({ error: "La pregunta no está eliminada" });
    }

    await pregunta.restore();
    res.json({ msg: "Pregunta recuperada con éxito", pregunta });
  } catch (error) {
    console.error("Error al recuperar pregunta:", error);
    res.status(500).json({ error: "Error al recuperar pregunta" });
  }
};

// --- PREGUNTAS ELIMINADAS ---
const preguntasEliminadas = async (req, res) => {
  try {
    const eliminadas = await Pregunta.findAll({
      paranoid: false,
      where: { deletedAt: { [Op.not]: null } },
    });
    res.json(eliminadas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eliminadas" });
  }
};

// --- EDITAR PREGUNTA ---
const editarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      grado, area, pregunta, titulo_texto, contexto,
      opcionA, opcionB, opcionC, opcionD,
      respuesta_correcta, justificacion, sesion, simulacro,
      nivel_dificultad
    } = req.body;

    const preguntaBd = await Pregunta.findByPk(id);
    if (!preguntaBd) return res.status(404).json({ msg: "Pregunta no encontrada" });

    // 1. Actualizar campos planos
    if (grado) preguntaBd.grado = grado;
    if (area) preguntaBd.area = area;
    if (nivel_dificultad) preguntaBd.nivel_dificultad = nivel_dificultad;
    if (pregunta) preguntaBd.texto_pregunta = pregunta;
    if (titulo_texto) preguntaBd.titulo_texto = titulo_texto;
    if (contexto) preguntaBd.contexto = contexto;
    if (justificacion) preguntaBd.justificacion = justificacion;

    // 2. Lógica para actualizar JSON de opciones
    // Reconstruimos las opciones basándonos en lo existente + lo nuevo
    let nuevasOpciones = preguntaBd.opciones ? [...preguntaBd.opciones] : [];
    
    const actualizarOpcionJSON = (letra, nuevoTexto) => {
       const index = nuevasOpciones.findIndex(o => o.id === letra);
       if (index >= 0) {
           if (nuevoTexto) nuevasOpciones[index].texto = nuevoTexto;
           // Actualizar flag de correcta
           nuevasOpciones[index].esCorrecta = (respuesta_correcta === letra);
       } else if (nuevoTexto) {
           nuevasOpciones.push({ id: letra, texto: nuevoTexto, esCorrecta: (respuesta_correcta === letra) });
       }
    };

    // Si recibimos nuevas opciones, las procesamos
    if (opcionA || opcionB || opcionC || opcionD || respuesta_correcta) {
        actualizarOpcionJSON("A", opcionA);
        actualizarOpcionJSON("B", opcionB);
        actualizarOpcionJSON("C", opcionC);
        actualizarOpcionJSON("D", opcionD);
        // ... repetir para E, F, G, H si es necesario
        preguntaBd.opciones = nuevasOpciones; // Guardamos el array actualizado
    }

    await preguntaBd.save();

    // 3. Gestionar cambio de asignación a Simulacro (Tabla Intermedia)
    if (simulacro) {
       const simulacroFound = await Simulacro.findOne({ where: { titulo: simulacro } });
       if (simulacroFound) {
          // Buscamos si ya existe la relación
          const relacion = await SimulacroPregunta.findOne({
             where: { id_simulacro: simulacroFound.id, id_pregunta: preguntaBd.id }
          });
          
          if (relacion) {
             // Si existe, actualizamos sesión
             if (sesion) {
                 relacion.sesion_asignada = parseInt(sesion);
                 await relacion.save();
             }
          } else {
             // Si no existe, creamos la relación
             await simulacroFound.addPregunta(preguntaBd, { 
                 through: { sesion_asignada: parseInt(sesion) || 1 } 
             });
          }
       }
    }

    res.status(200).json({ msg: "Pregunta actualizada", pregunta: preguntaBd });
  } catch (error) {
    console.error("Error al editar:", error);
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
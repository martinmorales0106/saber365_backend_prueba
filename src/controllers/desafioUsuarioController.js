const { DesafioUsuario } = require("../db");

const obtenerDesafioUsuario = async (req, res, next) => {
  const { usuarioId } = req.params;

  try {
    const progreso = await DesafioUsuario.findOne({
      where: { usuarioId },
    });

    if (!progreso) {
      // Crear progreso por defecto si no existe
      progreso = await DesafioUsuario.create({
        usuarioId,
        nivelAlcanzado: 1, // Valor por defecto
        // Puedes agregar otros campos con valores por defecto si es necesario
      });
    }

    return res.status(200).json({
      msg: "Progreso encontrado correctamente.",
      progreso,
    });
  } catch (error) {
    console.error("Error al obtener el progreso:", error);
    return res.status(500).json({
      msg: "Hubo un error al obtener el progreso del desafío.",
    });
  }
};

const actualizarDesafioUsuario = async (req, res, next) => {
  const { usuarioId } = req.params;
  const { nivelAlcanzado, infoExtra } = req.body;

  if (!nivelAlcanzado) {
    return res.status(400).json({ msg: "El campo nivelAlcanzado es requerido." });
  }

  try {
    const [progreso, creado] = await DesafioUsuario.findOrCreate({
      where: { usuarioId },
      defaults: { nivelAlcanzado, infoExtra },
    });

    if (!creado && (
      progreso.nivelAlcanzado !== nivelAlcanzado ||
      progreso.infoExtra !== infoExtra
    )) {
      await progreso.update({ nivelAlcanzado, infoExtra });
    }

    return res.status(200).json({
      msg: creado
        ? "Progreso creado correctamente."
        : "Progreso actualizado correctamente.",
      progreso,
    });
  } catch (error) {
    console.error(`Error al actualizar el progreso del usuario ${usuarioId}:`, error);
    return res.status(500).json({
      msg: "Hubo un error al actualizar el progreso del desafío.",
    });
  }
};


module.exports = {
  obtenerDesafioUsuario,
  actualizarDesafioUsuario,
};

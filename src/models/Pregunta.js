const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Pregunta = sequelize.define(
    "Pregunta",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      grado: {
        type: DataTypes.STRING, // "3", "5", "11"
        allowNull: false,
      },
      area: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nivel_dificultad: {
        type: DataTypes.INTEGER, // 1 al 10, o 1=Bajo, 2=Medio, 3=Alto
        defaultValue: 1,
      },
      titulo_texto: {
        type: DataTypes.TEXT,
      },
      contexto: {
        type: DataTypes.TEXT,
      },
      pie_texto: {
        type: DataTypes.TEXT,
      },
      imagen: {
        type: DataTypes.STRING,
      },
      texto_pregunta: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      opciones: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      afirmacion: {
        type: DataTypes.TEXT,
      },
      evidencia: {
        type: DataTypes.TEXT,
      },
      justificacion: {
        type: DataTypes.TEXT,
      },
      opcion_invalida: {
        type: DataTypes.TEXT,
      },
      img_Justificacion: {
        type: DataTypes.STRING,
      },
      img_opcion_invalida: {
        type: DataTypes.STRING,
      },
      competencia: {
        type: DataTypes.STRING,
      },
      componente: {
        type: DataTypes.STRING,
      },
      tema: {
        type: DataTypes.STRING,
      },
      sub_tema: {
        type: DataTypes.STRING,
      },
      enlace: {
        type: DataTypes.STRING,
      },
      // Flags para saber dónde se puede usar
      es_publica: { type: DataTypes.BOOLEAN, defaultValue: true }, // Para desafíos gratuitos
      es_premium: { type: DataTypes.BOOLEAN, defaultValue: false }, // Solo para simulacros pagos
    },
    { timestamps: true, paranoid: true }
  );
  return Pregunta;
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Pregunta = sequelize.define("Pregunta", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contexto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagen: {
      type: DataTypes.STRING,
    },
    pregunta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    opcionA: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opcionB: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opcionC: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opcionD: {
      type: DataTypes.STRING,
    },
    respuesta_correcta: {
      type: DataTypes.STRING,
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
    img_Justificacion: {
      type: DataTypes.STRING,
    },
    sesion: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    competencia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    componente: {
      type: DataTypes.STRING,
    },
    nivel: {
      type: DataTypes.STRING,
    },
  },{ timestamps: true, paranoid: true },
);
  return Pregunta;
};

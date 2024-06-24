const nodemailer = require("nodemailer");
require("dotenv").config();
const { MAIL_USER, MAIL_PASS, FRONTEND_URL } = process.env;


const emailRegistro = async (datos) => {
  const { email, nombreUsuario, token } = datos;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAIL_USER, // Reemplaza con tu dirección de correo electrónico de Gmail
      pass: MAIL_PASS, // Reemplaza con la contraseña de aplicación generada
    },
  });

  try {
    await transporter.sendMail({
      from: MAIL_USER,
      to: email,
      subject: "Saber365 - Comprueba tu cuenta",
      text: "Comprueba tu cuenta en Saber365",
      html: `
        <div style="background-color: #001F3F; padding: 50px;">
          <div style="background-color: rgba(52, 152, 219, 0.2); padding: 20px; border-radius: 5px; text-align: center;">
            <img src="https://res.cloudinary.com/dnkasq2l0/image/upload/v1719192799/Logo_principal_color_chwhkg.png" style="text-align: center; max-width: 100%; width: 260px; height: auto;"/>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 18px; color: #ffffff; font-weight: bold; text-align: center;">
              Hola: ${nombreUsuario},
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-align: center;">
              Tu cuenta de Saber365 ya está casi lista, solo debes comprobarla en el siguiente enlace:
            </p>
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/autenticar/confirmar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #b87a07; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 5px;">
                Comprobar Cuenta
              </a>
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-align: center;">
              Si tú no creaste esta cuenta, puedes ignorar el mensaje.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.log(error);
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const emailOlvidePassword = async (datos) => {
  const { email, nombreUsuario, token } = datos;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAIL_USER, // Reemplaza con tu dirección de correo electrónico de Gmail
      pass: MAIL_PASS, // Reemplaza con la contraseña de aplicación generada
    },
  });

  try {
    await transporter.sendMail({
      from: MAIL_USER,
      to: email,
      subject: "Saber365 - Restablece tu password",
      text: "Restablece tu Password en Saber365",
      html: `
      <div style="background-color: #001F3F; padding: 50px;">
      <div style="background-color: rgba(52, 152, 219, 0.2); padding: 20px; border-radius: 5px; text-align: center;">
        <img src="https://res.cloudinary.com/dnkasq2l0/image/upload/v1719192799/Logo_principal_color_chwhkg.png" style="text-align: center; max-width: 100%; width: 260px; height: auto;"/>
        <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 18px; color: #ffffff; font-weight: bold; text-align: center;">
        Hola: ${nombreUsuario},
        </p>
        <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-align: center;">
        has solicitado restablecer tu password
        </p>
        <p style="text-align: center;">
          <a href="${FRONTEND_URL}/autenticar/olvide-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #b87a07; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 5px;">
            Restablecer Contraseña
          </a>
        </p>
        <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-align: center;">
        Si tu no solicitaste este email, puedes ignorar el mensaje.
        </p>
      </div>
    </div>
      `,
    });
  } catch (error) {
    console.log(error);
    console.error("Error al recuperar el usuario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = { emailRegistro, emailOlvidePassword };

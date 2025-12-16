const { hoursToMinutes } = require('date-fns');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');
class Email {
  firstName;

  userEmail;

  from = `Paulo Edvandro <${process.env.EMAIL_FROM}>`;

  constructor(user, url) {
    this.userEmail = user.email;
    this.firstName = (user.name || user.username).split(' ')[0];
    this.url = url;
  }

  generateTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.SENDEMAIL_HOST,
        port: process.env.SENDEMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.SENDEMAIL_USERNAME,
          pass: process.env.SENDEMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.userEmail,
      subject: subject,
      html,
      text: htmlToText.convert(html),

      //html
    };
    try {
      await this.generateTransport().sendMail(mailOptions);
    } catch (err) {
      console.error('Erro no sendMail em Email.send:', err);
      throw err;
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Bem-vindo a familia Natours');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Sua senha de redefinição (válida por 10 minutos apenas)',
    );
  }
  async sendEmailConfirmation() {
    await this.send(
      'emailConfirmation',
      'Confirme aqui o seu email (válido por 10 minutos apenas)',
    );
  }
}
module.exports = Email;

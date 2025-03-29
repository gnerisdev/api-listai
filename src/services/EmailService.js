import nodemailer from 'nodemailer';
import { EMAIL_ROOT, EMAIL_ROOT_PASS } from '../environments/index.js';
import { LogUtils } from '../utils/LogUtils.js';

export class EmailService {
  #userEmail = EMAIL_ROOT;
  #passEmail = EMAIL_ROOT_PASS;

  getTransporter = () => {
    return nodemailer.createTransport({
      host: 'smtp.zoho.com',
      service: "Zoho",
      port: 465,
      secure: false, 
      auth: { user: this.#userEmail, pass: this.#passEmail },
      tls: { rejectUnauthorized: false }
    });
  }

  send = (mailOptions) => {
    const data = { 
      from: this.#userEmail, 
      to: mailOptions.to, 
      subject: mailOptions.subject, 
      text: mailOptions.text
    };

    const transporter = this.getTransporter();

    transporter.sendMail(data, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log("E-mail enviado com sucesso: " + info.response);
      }
    });
  }

  sendEmailOrder = (mailOptions, order, company = null) => {
    const data = { 
      from: `Pedido ${this.#userEmail}`, 
      to: mailOptions.to, 
      subject: mailOptions.subject,
      html: ''
    };

    const transporter = this.getTransporter('delivery');

    transporter.sendMail(data, function (error, info) {
      error ? LogUtils.errorLogger(error) : console.log(info.response);
    });
  }

  sendCode = (mailOptions, code, name) => {
    const data = { 
      from: this.#userEmail, 
      to: mailOptions.to, 
      subject: mailOptions.subject,
      html: ''
    };

    const transporter = this.getTransporter();

    transporter.sendMail(data, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log("E-mail enviado com sucesso: " + info.response);
      }
    });
  }
}

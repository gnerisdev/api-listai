import nodemailer from 'nodemailer';
import { EMAIL_ROOT, EMAIL_ROOT_PASS } from '../environments/index.js';
import { LogUtils } from '../utils/LogUtils.js';
import { confirmationGiftTemplate } from '../../templates/confirmationGiftTemplate.js';

export class EmailService {
  #userEmail = EMAIL_ROOT;
  #passEmail = EMAIL_ROOT_PASS;

  getTransporter = () => {
    return nodemailer.createTransport({
      host: 'webmail.listai.com.br',
      port: 465, 
      secure: true,
      auth: { user: this.#userEmail, pass: this.#passEmail },
      tls: { rejectUnauthorized: false }
    });
  };

  confirmationGift = (mailOptions, info) => {
    const html = confirmationGiftTemplate(info);

    const data = {
      from: `Lista - <${this.#userEmail}>`,
      to: mailOptions.to,
      subject: mailOptions.subject || 'Presente confirmado!',
      html,
    };

    const transporter = this.getTransporter();

    transporter.sendMail(data, function (error, info) {
      if (error) {
        console.log(error)
        LogUtils.errorLogger(error);
      } else {
        console.log('Email enviado: ' + info.response);
      }
    });
  };
}

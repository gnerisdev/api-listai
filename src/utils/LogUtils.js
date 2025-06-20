import moment from 'moment-timezone';
import winston from 'winston';

export class LogUtils {
  static logger(filename, level) {
    return winston.createLogger({
      level,
      format: winston.format.printf(info => info.message),
      transports: [
        new winston.transports.File({ filename, level }),
      ],
    });
  }

  static errorLogger(error, title = 'Erro no sistema') {
    const timestamp = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

    const message = error?.message || 'Mensagem de erro não disponível';
    const stackLine = error?.stack?.split('\n')?.[1]?.trim() || 'Local do erro não identificado';

    const logMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 REGISTRO DE ERRO

📌 ${title}
🕒 ${timestamp}

📄 Detalhe técnico:
${message}
↪️ ${stackLine}

`.trimStart();

    LogUtils.logger('error.log', 'error').error(logMessage);
  }
}

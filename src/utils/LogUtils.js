import winston from 'winston';

export class LogUtils {
  static logger(filename, level) {
    return winston.createLogger({
      level: level,
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ 
          filename, level 
        })
      ]
    });
  }

  static errorLogger(error) {
    const errorMessage = error.message;
    const errorLocation = error.stack.split('\n')[1].trim();
    const logMessage = `${errorMessage} (${errorLocation})`;

    LogUtils.logger('error.log', 'error')
      .error(logMessage);
  };
}

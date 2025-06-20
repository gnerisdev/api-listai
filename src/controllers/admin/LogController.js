import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

class LogController {
  async exportErrorLog(req, res) {
    const logFilePath = path.resolve('error.log');

    try {
      await fs.access(logFilePath);
    } catch (error) {
      return res.status(404).json({ message: 'Log de erro não encontrado.' });
    }

    let logContent;
    try {
      logContent = await fs.readFile(logFilePath, 'utf8');
    } catch (error) {
      console.error('Erro ao ler o arquivo de log:', error);
      return res.status(500).json({ message: 'Erro ao ler o arquivo de log.' });
    }

    res.setHeader('Content-Disposition', 'attachment; filename="error-log.txt"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(logContent);
  }
}

export default LogController;
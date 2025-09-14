import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { EmailService } from '../services/EmailService.js';

const DB_USER = 'root';
const DB_PASSWORD = '1234';
const DB_NAME = 'listai';
const BACKUP_DIR = path.join(process.cwd(), 'backups');

export function backup() {
  cron.schedule('0 3 * * *', async () => {
    console.log('Iniciando backup...');

    try {
      if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${DB_NAME}-${timestamp}.sql`;
      const filepath = path.join(BACKUP_DIR, filename);

      const dumpCommand = `mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${filepath}"`;

      exec(dumpCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erro no backup: ${error.message}`);
          return;
        }

        if (stderr) console.error(`⚠️ stderr: ${stderr}`);

        console.log(`✅ Backup criado: ${filename}`);

        const emailService = new EmailService();
        emailService.sendBackup(filepath, filename, 'contato@portoconect.com.br');
      });
    } catch (error) {
      console.error(`❌ Erro no backup: ${error}`);
    }
  });

}

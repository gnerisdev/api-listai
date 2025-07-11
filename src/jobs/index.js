import { backup } from './DatabaseJob.js';
import { paymentStatus, updateTransactions } from './GiftPaymentJob.js';

export function startAllJobs() {
  paymentStatus();
  // updateTransactions();
  backup();
}

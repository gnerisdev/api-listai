import { paymentStatusJob } from './giftPaymentJob.js';

export function startAllJobs() {
  paymentStatusJob();
}

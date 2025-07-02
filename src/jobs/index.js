import { backup } from './DatabaseJob.js';
import { paymentStatus } from './GiftPaymentJob.js';
import { 
  checkApprovedTransactionsForEventService, 
  updateEventServiceTransaction 
} from './ServicePaymentJob.js';

export function startAllJobs() {
  paymentStatus();
  updateEventServiceTransaction();
  checkApprovedTransactionsForEventService();
  backup();
}

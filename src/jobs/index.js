import { paymentStatusJob } from './GiftPaymentJob.js';
import { 
  checkApprovedTransactionsForEventService, 
  updateEventServiceTransaction 
} from './ServicePaymentJob.js';



export function startAllJobs() {
  paymentStatusJob();
  updateEventServiceTransaction();
  checkApprovedTransactionsForEventService();
}

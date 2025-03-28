import mongoose from 'mongoose';
import moment from 'moment-timezone';
const { Schema } = mongoose;

const verificationCodesSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
    require: true,
  },
  code: { type: Number, require: true },
  date: { type: Date, default: () => moment().tz('America/Sao_Paulo') },
});

export default mongoose.model('verificationCodes', verificationCodesSchema);

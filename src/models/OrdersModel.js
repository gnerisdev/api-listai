import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { cartSchema } from './CartModel.js';

const { Schema } = mongoose;

const ordersSchema = new Schema({
  id: Number,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
    require: true,
  },
  status: {
    type: {
      name: { type: String, required: true },
      label: { type: String, required: true }
    },
    required: true
  },
  paymentType: {
    type: String,
    enum: ['online', 'inDelivery', 'pix'],
    required: true
  },
  paymentMethod: {
    type: { icon: String, id: String, title: String, _id: String },
    required: true
  },
  date: { type: Date, default: () => moment().tz('America/Sao_Paulo') },
});

const ordersModel = new Schema({ ...cartSchema.obj, ...ordersSchema.obj });

ordersModel.pre('save', function(next) {
  const doc = this;
  mongoose.model('Orders', ordersModel, 'orders').findOne({}, {}, { sort: { 'id': -1 } }).exec(function(err, result) {
    let lastId = 0;
    if (result && result.id) lastId = result.id;
    doc.id = lastId + 1;
    next();
  });
});

export default mongoose.model('orders', ordersModel);

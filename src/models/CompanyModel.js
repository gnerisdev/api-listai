import mongoose from 'mongoose';
import { METHODS } from '../constant/methods.js';

const { Schema } = mongoose;

const companySchema = new Schema({
  storeUrl: { type: String, required: true },
  fantasyName: { type: String, required: true },
  slogan: String,
  description: String,
  whatsapp: String,
  email: { type: String, required: true, unique: true },
  verifyEmail: { type: Boolean, default: false },
  password: { type: String, required: true },
  active: { type: Boolean, default: true },
  online: { type: Boolean, default: false },
  owner: {
    name: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
  },
  address: {
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    number: { type: Number, trim: true },
    reference: { type: String, trim: true },
    street: { type: String, trim: true },
    district: { type: String, trim: true },
    zipCode: { type: String, maxLength: 9 },
    coordinates: { latitude: Number, longitude: Number },
    freeformAddress: { type: String, trim: true },
  },
  custom: {
    colorPrimary: { type: String, default: '#800080' },
    colorSecondary: { type: String, default: '#00FF00' },
    logo: { url: String, id: String },
    backgroundImage: { url: String, id: String },
    gallery: [{ url: String, id: String }],
  },
  subscription: { endpoint: String, keys: { p256dh: String, auth: String } },
  settings: {
    openingHours: {
      monday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      tuesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      wednesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      thursday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      friday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      saturday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
      sunday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '23:00' },
        alwaysOpen: { type: Boolean, default: false },
        alwaysClosed: { type: Boolean, default: false },
      },
    },
  },
  settingsPayment: {
    methods: {
      type: [
        { 
          id: String, 
          title: String, 
          parent: String,
          image: String 
        }
    ],
      default: METHODS,
    },
    mercadoPago: { active: Boolean, publicKey: String, accessToken: String },
    pix: {
      active: { default: false, type: Boolean },
      key: String,
      name: String,
      city: String,
      keyType: {
        type: String,
        enum: ['cpf', 'email', 'telefone', 'aleatoria' ]
      }
    }
    
  },
  settingsDelivery: {
    allowStorePickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: true },
    deliveryOption: { //taxa de delivery
      type: String,
      default: 'customerPickup',
      enum: ['automatic', 'customerPickup', 'fixed'],
    },
    minValue: { type: Number, default: 0 },
    kmValue: { type: Number, default: 0 },
    fixedValue: { type: Number, default: 0 },
  },
});

export default mongoose.model('companies', companySchema);

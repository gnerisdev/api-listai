import mongoose from 'mongoose';
const { Schema } = mongoose;

export const cartSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
    require: true,
  },
  products: [{
    complements: [
      {
        id: String,
        parentId: String,
        price: Number,
        quantity: Number,
        name: String,
      },
    ],
    productId: String,
    productName: String,
    quantity: Number,
    priceTotal: Number,
    imageUrl: String,
    comment: String
  }],
  subtotal: Number,
  total: Number,
  deliveryFee: Number,
  deliveryType: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'pickup'  
  },
  address: {
    zipCode: String,
    position: { latitude: String, longitude: String },
    distance: Number,
    reference: String,
    price: Number,
    number: Number,
    street: String,
    district: String,
    city: String,
    freeformAddress: String,
    deliveryOption: String,
    searchMethod: { type: String, enum: ['automatic', 'manual'] }
  },
  client: {
    email: String,
    name: String,
    phoneNumber: String
  },
  expirationDate: {
    type: Date,
    default: () => Date.now() + 60 * 60 * 24 * 1000 
  }
});

cartSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('cart', cartSchema);

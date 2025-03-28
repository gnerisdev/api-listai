import mongoose from 'mongoose';
const { Schema } = mongoose;

const complementSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    require: true
  },
  name: {
    type: String,
    required: true,
  },
  isRequired: {
    type: Boolean,
    required: true,
  },
  min: { //Quantidade mínima
    type: Number,
    required: true,
  },
  max: { //Quantidade máxima
    type: Number,
    required: true,
  },
  options: [{
    name: { //Nome do item adicional
      type: String,
      required: true,
    },
    price: { //Preço adicional
      type: Number,
      required: true,
    },
  }]
});

export default mongoose.model('complements', complementSchema);

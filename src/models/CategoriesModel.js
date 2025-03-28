import mongoose from 'mongoose';
const { Schema } = mongoose;

const categoriesSchema = new Schema({ 
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
    require: true
  },
  title: { 
    type: String, 
    unique: true,
    required: true 
  }, 
  isActive: {
    type: Boolean, 
    required: true 
  },
  displayPosition: { 
    type: Number 
  },
});

categoriesSchema.pre('save', async function (next) {
  if (!this.displayPosition) {
    const maxDisplayPosition = await mongoose
      .model('categories')
      .findOne({ company: this.company })
      .sort('-displayPosition')
      .select('displayPosition');
    this.displayPosition =
      maxDisplayPosition && maxDisplayPosition.displayPosition
        ? maxDisplayPosition.displayPosition + 1
        : 1;
  }
  next();
});

export default mongoose.model('categories', categoriesSchema);
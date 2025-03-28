import mongoose from 'mongoose';

const uri = "mongodb+srv://gnerisdev:01020304@casa-clean.2tmfv.mongodb.net/?retryWrites=true&w=majority&appName=casa-clean";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('mongodb: ok'))
  .catch((error) => console.error('Error conn mongodb:', error));

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: false // Hacer que el campo roomId sea opcional
  },
  sender: {
    type: String,
    required: false // Hacer que el campo sender sea opcional
  },
  message: {
    type: String,
    required: true // Mantener el campo message como requerido
  }, 
  user: {
    type: String,
    required: true // Mantener el campo message como requerido
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});


const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;



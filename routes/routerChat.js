import express from "express";
import MessageModel from "../dao/models/messageModel.js";

const router = express.Router();
// Ruta GET para renderizar la vista chat.handlebars
router.get("/chat", async (req, res) => {
  try {
    // Obtener todos los mensajes de la colección
    const messages = await MessageModel.find().lean();

    const modifiedMessages = messages.map((message) => ({
      timestamp: message.timestamp,
      message: message.message,
      user: message.user,
    }));

    // Renderizar la vista chat.handlebars
    res.render("chat", { messages: modifiedMessages });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta POST para guardar un nuevo mensaje en la colección
router.post("/chat", async (req, res) => {
  try {
    const { user, message } = req.body;
    const newMessage = new MessageModel({ user, message });
    await newMessage.save();

    res.redirect("/chat");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

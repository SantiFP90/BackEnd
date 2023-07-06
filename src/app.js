import path from "path";
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import mongoose from "mongoose";

import routerProductos from "../routes/routerProducts.js";
import cartRouter from "../routes/routerCart.js";
import routerChat from "../routes/routerChat.js";

import ProductManager from "../dao/managers/productManager.js";
import CartManager from "../dao/managers/cartManager.js";

import CartModel from "../dao/models/cartModel.js";
import MessageModel from "../dao/models/messageModel.js";
import ProductModel from "../dao/models/productModel.js";

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server);

const mongoDBURL =
  "mongodb+srv://SantiFP90:tupac123@santifp90.vuaufnp.mongodb.net/ecommerce?retryWrites=true&w=majority";
mongoose
  .connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión exitosa a MongoDB");
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
  });

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

// Configurar Handlebars como el motor de plantillas
const handlebars = exphbs.create({
  allowProtoProperties: true,
  allowProtoMethods: true,
  allowProtoPropertiesByDefault: true,
});

app.engine("handlebars", handlebars.engine);
app.set("views", path.join(currentDir, "views"));
app.set("view engine", "handlebars");

app.use(express.json());

const productManager = new ProductManager(ProductModel);
const cartManager = new CartManager(CartModel);

const PORT = 8080;

app.use("/api/products", routerProductos);

app.use("/api/carts", cartRouter);

app.use("/", routerChat);

// Ruta para renderizar la vista home.handlebars
app.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("index", { products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).send("Internal server error");
  }
});

// Ruta para renderizar la vista realTimeProducts.handlebars
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).send("Internal server error");
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Escuchar eventos de cambio en la lista de productos
  productManager.on("change", (products) => {
    // Emitir evento 'update' con la lista actualizada de productos
    socket.emit("update", products);
  });

  // Manejar evento 'createProduct' para crear un nuevo producto
  socket.on("createProduct", async (product) => {
    try {
      const newProduct = await productManager.addProduct(product);

      // Emitir evento 'update' con el producto recién creado a todos los clientes
      io.emit("update", newProduct);

      console.log("Product created:", newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  });

  // Manejar evento 'deleteProduct' para eliminar un producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await productManager.deleteProduct(productId);

      // Emitir evento 'update' con el ID del producto eliminado a todos los clientes
      io.emit("delete", productId);

      console.log("Product deleted:", productId);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  });

  // Manejar evento 'addToCart' para agregar un producto al carrito
  socket.on("addToCart", async ({ cartId, productId }) => {
    try {
      const updatedCart = await cartManager.addProductToCart(cartId, productId);

      // Emitir evento 'updateCart' con el carrito actualizado a todos los clientes
      io.emit("updateCart", updatedCart);

      console.log("Product added to cart:", { cartId, productId });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  });

  // Manejar evento 'removeFromCart' para eliminar un producto del carrito
  socket.on("removeFromCart", async ({ cartId, productId }) => {
    try {
      const updatedCart = await cartManager.removeProductFromCart(
        cartId,
        productId
      );

      // Emitir evento 'updateCart' con el carrito actualizado a todos los clientes
      io.emit("updateCart", updatedCart);

      console.log("Product removed from cart:", { cartId, productId });
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  });

  // Manejar evento 'sendMessage' para guardar un mensaje
  socket.on("sendMessage", async (data) => {
    try {
      // Crear una nueva instancia del modelo de mensaje
      const newMessage = new MessageModel({
        user: data.user,
        message: data.message,
      });

      // Guardar el mensaje en la base de datos
      await newMessage.save();

      console.log("Message saved:", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

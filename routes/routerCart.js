import express from "express";
import CartManager from "../dao/managers/cartManager.js";
import CartModel from "../dao/models/cartModel.js";

const router = express.Router();
const cartManager = new CartManager(CartModel);

// Ruta raíz POST /api/carts
router.post("/", async (req, res) => {
  try {
    const newCartId = await cartManager.createCart();

    res
      .status(201)
      .json({ message: "Cart created successfully", cartId: newCartId });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta GET /api/carts/:cid
router.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
    } else {
      res.json(cart);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta POST /api/carts/:cid/product/:pid
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid.trim();
    const productId = req.params.pid;

    await cartManager.addProductToCart(cartId, productId);

    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta DELETE /api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    await cartManager.removeProductFromCart(cartId, productId);

    res.json({ message: "Product removed from cart successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta PUT /api/carts/:cid
router.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const products = req.body.products;

    await cartManager.updateCart(cartId, products);

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta PUT /api/carts/:cid/products/:pid
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    await cartManager.updateProductQuantity(cartId, productId, quantity);

    res.json({ message: "Product quantity updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    await cartManager.clearCart(cartId);
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import express from 'express';
import CartManager from '../dao/managers/cartManager.js';
import CartModel from '../dao/models/cartModel.js';

const router = express.Router();
const cartManager = new CartManager(CartModel);


// Ruta raíz POST /api/carts
router.post('/', async (req, res) => {
  try {
    const newCartId = await cartManager.createCart();

    res.status(201).json({ message: 'Cart created successfully', cartId: newCartId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
    } else {
      res.json(cart);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid.trim();
    const productId = req.params.pid;

    await cartManager.addProductToCart(cartId, productId);


    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;




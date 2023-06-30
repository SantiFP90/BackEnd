import CartModel from '../models/cartModel.js';
import ProductModel from '../models/productModel.js';

class CartManager {
  async createCart() {
    try {
      const newCart = new CartModel({
        products: [],
        total: 0
      });

      await newCart.save();
      return newCart._id;
    } catch (error) {
      throw new Error('Failed to create cart');
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await CartModel.findById(cartId);
      return cart;
    } catch (error) {
      throw new Error('Failed to get cart by ID');
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      const existingProduct = cart.products.find(item => item.product.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }
      await cart.save();
    } catch (error) {
      throw new Error('Failed product to cart');
    }
  }



}

export default CartManager;





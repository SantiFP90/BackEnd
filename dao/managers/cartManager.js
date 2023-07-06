import CartModel from "../models/cartModel.js";
import ProductModel from "../models/productModel.js";

class CartManager {
  async createCart() {
    try {
      const newCart = new CartModel({
        products: [],
        total: 0,
      });

      await newCart.save();
      return newCart._id;
    } catch (error) {
      throw new Error("Failed to create cart");
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await CartModel.findById(cartId);
      return cart;
    } catch (error) {
      throw new Error("Failed to get cart by ID");
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      const existingProduct = cart.products.find(
        (item) => item.product.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }
      await cart.save();
    } catch (error) {
      throw new Error("Failed product to cart");
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }
      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }
      cart.products.splice(productIndex, 1);
      await cart.save();
    } catch (error) {
      throw new Error("Failed to remove product from cart");
    }
  }

  async updateCart(cartId, products) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }
      cart.products = products;
      await cart.save();
    } catch (error) {
      throw new Error("Failed to update cart");
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }
      const existingProduct = cart.products.find(
        (item) => item.product.toString() === productId
      );
      if (!existingProduct) {
        throw new Error("Product not found in cart");
      }
      existingProduct.quantity = quantity;
      await cart.save();
    } catch (error) {
      throw new Error("Failed to update product quantity");
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }
      cart.products = [];
      await cart.save();
    } catch (error) {
      throw new Error("Failed to clear cart");
    }
  }
}

export default CartManager;

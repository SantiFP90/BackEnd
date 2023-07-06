import { EventEmitter } from "events";
import ProductModel from "../models/productModel.js";

class ProductManager extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
  }

  async getProducts(
    limit = 10,
    page = 1,
    sort = "",
    query = "",
    name = "",
    category = ""
  ) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      let filter = {};
      if (name) {
        filter.name = name;
      }
      if (category) {
        filter.category = category;
      }

      const countPromise = ProductModel.countDocuments(filter);
      const productsPromise = ProductModel.find(filter)
        .sort({ price: sort === "desc" ? -1 : 1 })
        .skip(startIndex)
        .limit(limit);

      const [total, products] = await Promise.all([
        countPromise,
        productsPromise,
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        total,
        page,
        totalPages,
        products,
      };
    } catch (error) {
      throw new Error(`Error retrieving products: ${error}`);
    }
  }

  async getProductById(id) {
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw new Error(`Error retrieving product: ${error}`);
    }
  }

  async getProductByCode(code) {
    try {
      const product = await ProductModel.findOne({ code });
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw new Error(`Error retrieving product: ${error}`);
    }
  }

  async addProduct(product) {
    try {
      const createdProduct = await ProductModel.create(product);
      this.emit("change");
      this.io.emit("update", createdProduct);
      return createdProduct.id;
    } catch (error) {
      throw new Error(`Error creating product: ${error}`);
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const product = await ProductModel.findByIdAndUpdate(id, updatedFields, {
        new: true,
      });
      if (!product) {
        throw new Error("Product not found");
      }
      this.emit("change");
      this.io.emit("update", product);
    } catch (error) {
      throw new Error(`Error updating product: ${error}`);
    }
  }

  async updateProductByCode(code, updatedFields) {
    try {
      const product = await ProductModel.findOneAndUpdate(
        { code },
        updatedFields,
        { new: true }
      );
      if (!product) {
        throw new Error("Product not found");
      }
      this.emit("change");
      this.io.emit("update", product);
    } catch (error) {
      throw new Error(`Error updating product: ${error}`);
    }
  }

  async deleteProductById(id) {
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        throw new Error("Product not found");
      }
      this.emit("change");
      this.io.emit("update", deletedProduct.id);
      return deletedProduct;
    } catch (error) {
      throw new Error(`Error deleting product: ${error}`);
    }
  }

  async deleteProductByCode(code) {
    try {
      const deletedProduct = await ProductModel.findOneAndDelete({ code });
      if (!deletedProduct) {
        throw new Error("Product not found");
      }
      this.emit("change");
      this.io.emit("update", deletedProduct.id);
      return deletedProduct;
    } catch (error) {
      throw new Error(`Error deleting product: ${error}`);
    }
  }
}

export default ProductManager;

import express from "express";
import ProductManager from "../dao/managers/productManager.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtener la ruta del archivo actual
const currentFilePath = fileURLToPath(import.meta.url);

// Obtener el directorio base
const currentDir = dirname(currentFilePath);

const productManager = new ProductManager(
  path.join(currentDir, "../src/productos.json")
);

const router = express.Router();

// Ruta raíz GET /api/products
router.get("/", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort = "",
      query = "",
      name = "",
      category = "",
    } = req.query;
    const products = await productManager.getProducts(
      parseInt(limit),
      parseInt(page),
      sort,
      query,
      name,
      category
    );
    // Calcular el número total de páginas
    const totalPages = Math.ceil(products.total / limit);
    // Construir los datos de paginación
    const paginationData = {
      status: "success",
      payload: products.products,
      totalPages,
      prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null,
      nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
      page: parseInt(page),
      hasPrevPage: parseInt(page) > 1,
      hasNextPage: parseInt(page) < totalPages,
      prevLink:
        parseInt(page) > 1
          ? `/api/products?limit=${limit}&page=${parseInt(page) - 1}`
          : null,
      nextLink:
        parseInt(page) < totalPages
          ? `/api/products?limit=${limit}&page=${parseInt(page) + 1}`
          : null,
    };
    const context = {
      products: paginationData.payload.map((p) => p.toObject()),
    };
    res.render("products", context);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productManager.getProductById(productId);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta POST /api/products
router.post("/", async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const product = { name, price, description, category };

    const productId = await productManager.addProduct(product);

    res
      .status(201)
      .json({ id: productId, message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:code", async (req, res) => {
  try {
    const productCode = req.params.code;
    const updatedFields = req.body;

    // Verificar si el producto existe
    const existingProduct = await productManager.getProductByCode(productCode);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Verificar si se intenta actualizar el campo 'code'
    if (updatedFields.hasOwnProperty("code")) {
      return res.status(400).json({ error: "Cannot update product code" });
    }

    // Actualizar los campos especificados en el producto
    await productManager.updateProduct(existingProduct.id, updatedFields);

    // Obtener el producto actualizado para emitir en el evento 'update'
    const updatedProduct = await productManager.getProductById(
      existingProduct.id
    );

    // Emitir el evento 'update' con los datos del producto actualizado
    productManager.emit("update", updatedProduct);

    return res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:code", async (req, res) => {
  try {
    const productCode = req.params.code;

    // Verificar si el producto existe
    const existingProduct = await productManager.getProductByCode(productCode);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Eliminar el producto
    await productManager.deleteProductByCode(productCode);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

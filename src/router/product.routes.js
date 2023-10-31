import express from 'express';
import { Router } from "express";
import mongoose from "mongoose";
import * as path from "path";
import { productsModel } from '../models/products.model.js';
import ProductManager from "../controllers/ProductManager.js"
import { EventEmitter } from 'events'


const productRouter = Router()
const product = new ProductManager();
const bus = new EventEmitter();

bus.setMaxListeners(15);

// Se agregan los productos 
productRouter.post("/", async (req, res) => {
    let newProduct = req.body
    res.send(await product.addProduct(newProduct))
})

//actualizar productos
productRouter.put("/:id", async (req, res) => {
    let id = req.params.id
    let updProd = req.body
    res.send(await product.updateProduct(id, updProd))
})

//traer productos por id 8080/api/products/pid
productRouter.get("/:id", async (req, res) => {
    try {
        const prodId = req.params.id;
        const productDetails = await product.getProductById(prodId);
        res.render("viewDetails", {product: productDetails} )
    } catch (error) {
        console.error("Error al obtener el producto", error);
        res.status(500).json({error: "Error al obtener el producto"});
    }
})


productRouter.get('/', async (req, res) => { 
    try {
        const {limit = 1, page= 1, order=1, description} = req.query
        let filtro = description ? {description} : {}
        let products = await productsModel.paginate(filtro,{limit : parseInt(limit), page: parseInt(page), sort: {price: parseInt(order)}, lean:true});
        if(!products){
            res.send({status:"error", error: "No se encontraron productos..."})
        }
        res.send({ status: "success", payload: products });
    } catch (error) {
        console.log(error);
    }
});


productRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Id de producto no valido")
        }
        const deleteProduct = await product.delProducts(id);
        if (!deleteProduct) {
            return res.status(404).send("Producto no encontrado")
        }
        res.send("Producto eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar el producto", error);
        res.status(500).send({error: "Error al eliminar el producto"});
    }
})

export default productRouter
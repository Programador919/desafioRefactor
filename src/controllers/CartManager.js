import {promises as fs} from 'fs';
import {nanoid} from 'nanoid';
import ProductManager from './ProductManager.js';
import { cartsModel } from '../models/carts.model.js';
import mongoose from 'mongoose';


const productAll = new ProductManager();

class CartManager extends cartsModel{
    constructor() {
        super();
    }
    
    readCarts = async () => {
        let carts = await fs.readFile(this.path, "utf-8");
        return JSON.parse(carts);
    }

    writeCarts = async (cart) => {
        await fs.writeFile(this.path, JSON.stringify(cart));
    }

    exist = async (id) => {
        let carts = await this.readCarts();
        return carts.find(cart => cart.id === id);
    }

    addCarts = async () => {
        let oldCarts = await this.readCarts();
        let id = nanoid()
        let cartsConcat = [{ id : id, products : []}, ...oldCarts]
        await this.writeCarts(cartsConcat)
        return "Carrito agregado"
    }

    getCartsById = async (id) => {
        let cartById = await this.exist(id)
        if(!cartById) return "Carrito no encontrado"
        return cartById;
    };

    addProductToCart = async (cartId, productId) => {
        let cartById = await this.exist(cartId)
        if(!cartById) return "Carrito no encontrado";
        let productById = await allProducts.exist(productId)
        if(!productById) return "Producto no encontrado";
        
        let allCarts = await this.readCarts()
        let cartFilter = allCarts.filter(cart => cart.id != cartId)

        if(cartById.products.some((prod) => prod.id === productId)){
            let addProductInCart = cartById.products.find(prod => prod.id === productId)
            addProductInCart.quantity++;
            let cartsConcat = [cartById, ...cartFilter]
            await this.writeCarts(cartsConcat)
            return "Producto sumado al carrito";
        }

        cartById.products.push({id:productById.id, quantity: 1})
        let cartsConcat = [cartById, ...cartFilter]
        await this.writeCarts(cartsConcat)
        return "Producto agregado al carrito";
    }

    async getCarts() {
        try {
            const carts = await cartsModel.find({})
            .populate({
                path: "products.product",
                model: "products",
                select: "image description price stock" ,
            });
            return carts;
        } catch (error) {
            console.error('Error al obtener los carritos', error);
            return [];
        }
    }

    //add
    async addCart(cartData) {
        try {
            await cartsModel.create(cartData);
            return 'carrito agregado';
        } catch (error) {
            console.error('Error al obtener datos para crear carrito', error);
            return 'Error al obtener datos para crear carrito';
        }
    }

    async getCartById(id) {
        try 
        {
            const cart = await cartsModel.findById(id)   
            if (!cart) {
                return 'Carrito no encontrado';
            } 
            return cart;
        } 
        catch (error) 
        {
            console.error('Error al obtener el carrito:', error);
            return 'Error al obtener el carrito';
        }
    }

    async addProductInCart(cartId, prodId) 
    {
        try 
        {
            const cart = await cartsModel.findById(cartId);
        
            if (!cart) 
            {
                return 'Carrito no encontrado';
            }
            
            const productIndex = cart.products.findIndex((product) =>product.productId.toString() === prodId.toString());
            if (productIndex !== -1) {
                cart.products[productIndex].quantity +=1;
            }else{
                cart.products.push({
                    productId: prodId,
                    quantity: 1,
                })
            }
            await cart.save();
            return 'Producto agregado al carrito';
        } catch (error) 
        {
            console.error('Error al agregar el producto al carrito:', error);
            return 'Error al agregar el producto al carrito';
        }
    }

    //get traer
    async getCartWithProducts(cartId) {
        try {
            const cart = await  cartsModel.findById(cartId)
            .populate({
                path: 'products.productId',
                model: 'products',
                select: 'image description price stock'
            })
            .lean();

            if (!cart) {
                return 'Carrito no encontrado';
            }
            return cart;

        } catch (error) {
            console.error('Error al obtener el carrito con los productos', error);
            return 'Error al obtener el carrito con los productos';
        }
    }

    //delete de u n producto por Id
    async removeProductFromCart(cartId, prodId) {
        try 
        {
            const cart = await cartsModel.findById(cartId);
            if(!cart){
                return "carrito no encontrado"
            }
            //busca el indice del producto
            const productIndex = cart.products.findIndex((product) => product.productId === prodId)
            
            if(productIndex !== -1 ) {
                cart.products.splice(productIndex, 1)
                await cart.save();
                return "Producto eliminado del carrito"
            }else {
                //si no lo encuentra en el carro
                return "Producto no encontrado en el carrito"
            }
        } catch (error) {
            console.error('Error al eliminar el producto del carrito,', error)
            return "Error al eliminar el producto del carrito"
        }
    }
    
    //eliminar todos los product del carrito
    async removeAllProductsFromCart(cartId) {
        try {
            const cart = await cartsModel.findById(cartId);
            if (!cart){
                return 'Carrito no encontrado'
            }

            //eliminar todos los product
            cart.products = [];
            await cart.save();

            return 'Todos los productos han sido eliminados del carrito ';
        } catch (error) {
            console.error("Error al eliminar los productos del carrito", error);
            return 'Error al eliminar los productos del carrito';
        }
    }

    async updateProductsInCart(cartId, newProduct) {
        try {
            const cart = await cartsModel.findById(cartId);

            if(!cart) {
                return 'Carrito no encontrado'
            }
            cart.products = newProduct
            await cart.save();
            return 'Carrito actualizado con nuevos productos';
        } catch (error) {
            console.error('Error al actualizar el carrito con nuevos productos', error);
            return 'Error al actualizar el carrito con nuevos productos';
        }
    }

    async updateProductInCart(cartId, productId, updateProduct) {
        try {
            const cart = await cartsModel.findById(cartId);

            if(!cart) {
                return 'Carrito no encontrado'
            }
            const productIndex = cart.products.findIndex((product) => product.product.toString() === productId.toString());

            if(productIndex === -1) {
                return  'Producto no encntrado en el carrito'
            }
            cart.products[productIndex].quantity = updateProduct.quantity;

            await cart.save();
            return 'Producto actualizado en el carrito';
        } catch (error) {
            console.error('Error al actualizar el producto en el carrito', error);
            return 'Error al actualizar el producto en el carrito';
        }
    }


}

export default CartManager
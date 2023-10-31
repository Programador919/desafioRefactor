//import mongoose, { Schema } from 'mongoose';
import  mongoose  from 'mongoose';

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
    products: [{
    
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
        },
        quantity: {
            type: Number,
            require: true
        } 
    
    }] 
});

export const cartsModel = mongoose.model(cartsCollection, cartsSchema)



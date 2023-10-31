import express  from 'express';
import { ExpressHandlebars, engine } from "express-handlebars";
import * as path from "path";
import  __dirname from "./utils.js"
import exphbs from "express-handlebars";

import mongoose from "mongoose";
import CartRouter from "./router/carts.routes.js"
import productRouter from "./router/product.routes.js"
import ProductManager from "./controllers/ProductManager.js"
import CartManager from "./controllers/CartManager.js";
import { createServer } from 'http';
import session from 'express-session'
import sessionFileStore from 'session-file-store';
import MongoStore from "connect-mongo"
import userRouter from './router/user.routes.js';
import initializePassport from './config/passport.config.js';

initializePassport();

const app = express();
//const PORT = 8080
const PORT = process.env.PORT || 8080;

const FileStore = sessionFileStore(session);
const product = new ProductManager()
const cart = new CartManager();
const ObjectId = mongoose.Types.ObjectId;
//const engine = exphbs.engine;
//Middleware para parsear json y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = createServer(app);

http.listen(PORT, ()=>{
    console.log(`Servidor Express Puerto ${PORT}`);
});
//-----------------mongoose----------------
mongoose.connect("mongodb+srv://user123:luis123@proyectocoder.sqvx5rc.mongodb.net/?retryWrites=true&w=majority")
.then(()=> {
    console.log("Conectado a la base de datos ")
})
.catch(error=> {
    console.error("Error al intentar conectarse a la DB", error);
})

//--------- session --------
app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://user123:luis123@proyectocoder.sqvx5rc.mongodb.net/?retryWrites=true&w=majority", //aqui va la direccion de la base de datos
        mongoOptions : {useNewUrlParser: true , useUnifiedTopology: true}, ttl:4000
    }),
    secret:"claveSecreta",
    resave: false,
    saveUninitialized:false,
}))



//Rutas
app.use("/api/product", productRouter)
app.use("/api/carts", CartRouter)
app.use("/api/sessions", userRouter)

//handlebarts de ayuda
const hbs = exphbs.create({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    extname: ".handlebars",
})

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));


//css statics
app.use("/", express.static(__dirname + "/public/css"))
app.use("/src/public", express.static("/public"));
//ruta 


//rederizado de productos
app.get("/product", async (req, res) => {
    try {
        let allProducts = await product.getProducts();
        allProducts = allProducts.map(product => product.toJSON());
        res.render("viewProducts", {
            title: "vista de Productos",
            products : allProducts
        })
    } catch (error) {
        console.error('Error al obtener productos', error);
        res.status(500).send('Error interno del servidor');
    }
})



                 //render productos en carrito
app.get("/carts/:id", async (req, res) => {
    try {
        const productId = req.params.id
        //const selectedProduct = await product.getProductById(productId);
        if(!ObjectId.isValid(productId)) {
            return res.status(400).json({error: 'ID invalido'})
        }
        const selectedProduct = await product.getProductById(productId);
        if(!selectedProduct) {
            return res.status(404).send('Producto no encontrado')
        }

        const id = req.params.id
        let allCarts = await cart.getCartWithProducts(id);
        
        res.render("viewCart", {
            carts: id,
            title : "vista del carrito",
            carts : allCarts
        
    })
    } catch (error) {
        console.error("Error al obtener el carrito ", error)
        res.status(500).send("Error interno del servidor")
    }
})




app.get("/detalle/:id", async (req, res) => {
    try {
        const productId = req.params.id
        
        if(!ObjectId.isValid(productId)) {
            return res.status(400).json({error: 'ID invalido'})
        }
        const selectedProduct = await product.getProductById(productId);
        if(!selectedProduct) {
            return res.status(404).send('Producto no encontrado')
        }
        
        res.render('viewDetails', {
            title: "Vista de Producto" ,
            product: selectedProduct
            
        })
    } catch (error) {
        console.error("Error al obtener el producto", error)
        res.status(500).send('Error del servidor')
    }
})

//-------------------- login ----------

//aqui podemos ingresar al login atravez de la ruta http://localhost:8080/login
app.get("/login", async (req, res)=>{
    res.render("login",{
        title:"Vista Login",
    });
})
//aqui con la ruta http://localhost:8080/register
app.get("/register", async (req, res)=>{
    res.render("register",{
        title:"Vista register",
    });
})
//aqui con la ruta http://localhost:8080/profile
app.get("/profile", async (req, res)=>{
    if(!req.session.emailUsuario){
        return res.redirect("/login")
    }
    res.render("profile",{
        title:"Vista profile Admin",
        first_name:req.session.nomUsuario,
        last_name: req.session.apeUsuario,
        email: req.session.emailUsuario,
        rol: req.session.rolUsuario,
    });
})


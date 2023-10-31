import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import local from 'passport-local';
import userModel from '../models/user.model.js'
import {createHash, isValidPassword} from '../utils.js'
import UserManager from '../controllers/UserManager.js';

const localStrategy = local.Strategy
const userMan = new UserManager();

const initializePassport = () => {
    passport.use("register", new localStrategy(
        {passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {
            const {first_name, last_name, email, age, rol} = req.body

            try {
                let user = await userMan.findEmail({email: username})
                if(user) {
                    console.log("El usuario ya existe");
                    return done(null, false);
                }

                const hashedPassword = await createHash(password)

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: hashedPassword,
                    rol
                }

                let result = await userMan.addUser(newUser);
                return done(null, result)
            } catch (error) {
                return done("Error al obtener el usuario: " + error)
            }
        }
    ))

    passport.serializeUser((user, done) =>{
        done(null, user.id)
    })

    passport.deserializeUser(async(id, done) =>{
        let user = await userMan.getUserById(id)
        done(null, user)
    })

    passport.use("login", new localStrategy({usernameField: "email"}, async(username, password, done) =>{
        try {
            const user = await userMan.findEmail({email: username})
            if(!user) {
                console.log("Usuario no existente");
                return done(null, false)
            }
            if(!isValidPassword(user, password))
            console.log("Contraseña invalida")
            return done(null, false)
        return done(null, user)
        } catch (error) {
            return done(error)
        }
    } ))


    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.cc556792e1813ccf",
        clientSecret: "5a5b60087a2b96bf8918aeeabda577f4b128cf79",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userModel.findOne({email:profile._json.email})
            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 80,
                    email: profile._json.email,
                    password: "",
                    rol: "usuario"
                }

                let result = await userModel.create(newUser)
                done(null, result)
            }else{
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }
    ))
}

export default initializePassport
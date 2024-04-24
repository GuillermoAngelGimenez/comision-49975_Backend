import { fileURLToPath } from "url";
import { dirname } from "path";
import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "./config/config.js";
import winston from "winston";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const SECRET = config.SECRETKEY;

export const creaHash = (password) =>bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validaPassword = (usuario, password) => bcrypt.compareSync(password, usuario.password);

export const passportCall=(estrategia)=>{
    return function(req, res, next) {
        passport.authenticate(estrategia, function(err, user, info, status) {
          if (err) { return next(err) }
          if (!user) {
                return res.errorCliente(info.message?info.message:info.toString())
          }
          req.user = user;
          return next()
        })(req, res, next);
      }
}

export const generaToken=(usuario)=>jwt.sign({...usuario}, SECRET, {expiresIn: "1h"}) 

export const verificarToken=(token)=>{return jwt.verify(token, SECRET)}

// logger
const customLevelOptions = {
  levels:{
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  }
}

const logger = winston.createLogger({
  levels: customLevelOptions.levels
});

if (config.MODE === "production") {
  console.log("production");

  logger.add(new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));

  logger.add(new winston.transports.File({
    level: "error",
    filename: "./src/logs/errors.log",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

if (config.MODE === "development") {
  console.log("development");

  logger.add(new winston.transports.Console({
    level: "debug",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export const middLogg = (req, res, next) => {
  req.logger = logger;
  next();
};


import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt, { hashSync } from "bcrypt";
import { PassThrough } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const creaHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validaPassword = (usuario, password) =>
  bcrypt.compareSync(password, usuario.password);

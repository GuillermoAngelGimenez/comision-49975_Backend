export class UsuariosController{
    constructor(){}

    static async registroUsuario(req, res) {
        let { error } = req.query;
      
        res.setHeader("Content-Type", "text/html");
        res.status(200).render("registrate", { error, login: false });
      }

    static async loginUsuario(req, res) {
        let { error, mensaje } = req.query;
      
        res.setHeader("Content-Type", "text/html");
        res.status(200).render("login", { error, mensaje, login: false });
      }
    


}
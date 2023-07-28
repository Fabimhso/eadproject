import db from "../utils/database";
import bcrypt from "bcrypt";
import * as Utils from "../utils/functions";
import { createConnection } from "mysql2/promise";
import { Request, Response } from "express";
import { host, user, database, password, port } from "../utils/config";
import * as Validator from "cpf-cnpj-validator";
import * as Site from "../models/Site";

declare module "express-session" {
  interface SessionData {
    login: {
      id: number,
      name: string,
      email: string,
      password: string
    }
  }
}

const connectionConfig: object = { host, user, password, database, port }

export function home(req: Request, res: Response): void {
  async function main() {
    var categorias_arr = [], cursos_arr = [], tecnologias_arr = [];

    const connection = await createConnection(connectionConfig);

    const [categorias, fields]: Array < any > = await connection.execute("SELECT * FROM categorias");

    for (let i = 0; i < categorias.length; i++) {
      let categoria_id: number = categorias[i].id;
      const [cursos, fields]: Array < any > = await connection.execute("SELECT * FROM cursos WHERE categoria_id = ?", [categoria_id]);
      
      if (cursos[0] === undefined) continue;
      categorias_arr.push(categorias[cursos[0].categoria_id - 1]);
      
      for (let j = 0; j < cursos.length; j++) cursos_arr.push({ curso: cursos[j], link: cursos[j].slug });
    }

    const [tecnologias, fields2]: Array < any > = await connection.execute("SELECT * FROM tecnologias");

    for (let i = 0; i < tecnologias.length; i++) tecnologias_arr.push(tecnologias[i]);

    res.render("home", {
      login: req.session!.login,
      categorias: categorias_arr,
      cursos: cursos_arr,
      tecnologias: tecnologias_arr
    });
  }

  main();
}

export function loja(req: Request, res: Response): void {
  async function main() {
    var categorias_arr = [], cursos_arr = [];

    const connection = await createConnection(connectionConfig);

    const [categorias, fields]: Array < any > = await connection.execute("SELECT * FROM categorias");

    for (let i = 0; i < categorias.length; i++) {
      let categoria_id: number = categorias[i].id;
      const [cursos, fields]: Array < any > = await connection.execute("SELECT * FROM cursos WHERE categoria_id = ?", [categoria_id]);

      if (cursos[0] === undefined) continue;
      categorias_arr.push(categorias[cursos[0].categoria_id - 1]);

      for (let j = 0; j < cursos.length; j++) cursos_arr.push({ curso: cursos[j], link: Utils.convertSlug(cursos[j].nome) });
    }

    res.render("loja", {
      login: req.session!.login,
      categorias: categorias_arr,
      cursos: cursos_arr,
    });
  }

  main();
}

export function certificados(req: Request, res: Response): void {
  if (Site.VerifyLogin("user", req)) {
    res.render("certificados", {
      login: req.session!.login
    });
  } else {
    Site.Redirect("/login?goto=certificados", res);
  }
}

export function contato(req: Request, res: Response): void {
  res.render("contato", { login: req.session!.login });
}

export function conta(req: Request, res: Response): void {
  res.json({ login: req.session!.login });
}

export function login(req: Request, res: Response): void {
  if (req.session!.login) {
    Site.Redirect("/biblioteca", res);
  } else {
    if (req.query.loginerror === "usernotfound") {
      res.render("login", {
        login: req.session!.login,
        error: true,
        type: "usernotfound"
      });
    } else if (req.query.loginerror === "connectiontimedout") {
      res.render("login", {
        login: req.session!.login,
        error: true,
        type: "connectiontimedout"
      });
    } else if (req.query.loginerror === "unknownerror") {
      res.render("login", {
        login: req.session!.login,
        error: true,
        type: "unknownerror"
      });
    } else {
      if (req.session!.login) {
        Site.Redirect("/biblioteca", res);
      } else {
        res.render("login", {
          login: req.session!.login,
          error: false
        });
      }
    }
  }
}

export function register(req: Request, res: Response): void {
  if (req.session!.login) {
    Site.Redirect("/biblioteca", res);
  } else {
    if (req.query.loginerror === "emptyform") {
      res.render("register", {
        login: req.session!.login,
        error: true,
        type: "emptyform"
      });
    } else if (req.query.loginerror === "noname") {
      res.render("register", {
        login: req.session!.login,
        error: true,
        type: "noname"
      });
    } else if (req.query.loginerror === "noemail") {
      res.render("register", {
        login: req.session!.login,
        error: true,
        type: "noemail"
      });
    } else if (req.query.loginerror === "nopasswd") {
      res.render("register", {
        login: req.session!.login,
        error: true,
        type: "nopasswd"
      });
    } else {
      if (req.session!.login) {
        Site.Redirect("/biblioteca", res);
      } else {
        res.render("register", {
          login: req.session!.login,
          error: false
        });
      }
    }
  }
}

export function logout(req: Request, res: Response): void {
  Site.LogOut(req, res);
}

export function postlogin(req: Request, res: Response): void {
  const {
    userEmailSI,
    userPasswdSI
  } = req.body;

  db.query("SELECT * FROM alunos WHERE email = ?", [userEmailSI, userPasswdSI], async (err, rows: any) => {
    if (!rows.length) {
      Site.Redirect("/login?loginerror=usernotfound", res);
    } else {
      try {
        if (await bcrypt.compare(userPasswdSI, rows[0].senha)) {
          req.session!.login = {
            id: rows[0].id,
            nome: rows[0].nome,
            email: rows[0].email,
            senha: rows[0].senha,
            cpf: rows[0].cpf
          };
          if (req.query.goto == undefined) {
            Site.Redirect("/biblioteca", res);
          } else {
            Site.Redirect("/" + req.query.goto, res);
          }
        } else {
          Site.Redirect("/login?loginerror=connectiontimedout", res);
        }
      } catch {
        Site.Redirect("/login?loginerror=unknownerror", res);
      }
    }
  });
}

export function postregister(req: Request, res: Response): void {
  async function main() {
    var {
      userNameSU,
      userEmailSU,
      userPasswdSU,
      userCPFSU,
    } = req.body;

    const connection = await createConnection(connectionConfig);

    if (userCPFSU != "") {
      const cpfValid = Validator.cpf.isValid(userCPFSU);

      if (cpfValid) {
        if (userNameSU === "" && userEmailSU === "" && userPasswdSU === "") {
          Site.Redirect("/register?signuperror=empyform", res);
        } else if (userNameSU === "") {
          Site.Redirect("/register?signuperror=noname", res);
        } else if (userEmailSU === "") {
          Site.Redirect("/register?signuperror=noemail", res);
        } else if (userPasswdSU === "") {
          Site.Redirect("/register?signuperror=nopasswd", res);
        } else {
          userPasswdSU = await bcrypt.hash(userPasswdSU, 10);
          userCPFSU = Validator.cpf.format(userCPFSU);

          const [users, fields]: Array < any > = await connection.execute("SELECT * FROM alunos WHERE email = ? AND cpf = ?", [userEmailSU, userCPFSU]);

          if (users.length == 0) {
            await connection.execute("INSERT INTO alunos (nome, email, senha, cpf) VALUES (?, ?, ?, ?)", [userNameSU, userEmailSU, userPasswdSU, userCPFSU])
            Site.Redirect("/login", res);
          } else {
            Site.Redirect("/register?signuperror=useralreadyexists", res);
          }
        }
      } else {
        Site.Redirect("/register?signuperror=invalidcpf", res)
      }
    } else {
      if (userNameSU === "" && userEmailSU === "" && userPasswdSU === "") {
        Site.Redirect("/register?signuperror=emptyform", res);
      } else if (userNameSU === "") {
        Site.Redirect("/register?signuperror=noname", res);
      } else if (userEmailSU === "") {
        Site.Redirect("/register?signuperror=noemail", res);
      } else if (userPasswdSU === "") {
        Site.Redirect("/register?signuperror=nopasswd", res);
      } else {
        userPasswdSU = await bcrypt.hash(userPasswdSU, 10);

        const [users, fields]: Array < any > = await connection.execute("SELECT * FROM alunos WHERE email = ?", [userEmailSU]);

        if (users.length == 0) {
          await connection.execute("INSERT INTO alunos (nome, email, senha) VALUES (?, ?, ?)", [userNameSU, userEmailSU, userPasswdSU])

          Site.Redirect("/login", res);
        } else {
          Site.Redirect("/register?signuperror=useralreadyexists", res);
        }
      }
    }
  }

  main();
}
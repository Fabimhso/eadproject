import db from "../utils/database"; // Database connection without promises
import * as Utils from "../utils/functions";
import { createConnection } from "mysql2/promise"; // Create Connection with database
import { Request, Response } from "express"; // Express mobule
import { host, user, database, password, port } from "../utils/config"; // For database connection
import * as Validator from "cpf-cnpj-validator";

declare module "express-session" {
  interface SessionData {
    adminlogin: {
      id: number,
      name: string,
      email: string,
      password: string
    }
  }
}

const connectionConfig: object = {
  host: host,
  user: user,
  password: password,
  database: database,
  port: port
}

export function home(req: Request, res: Response): void {
  async function main() {
    const connection = await createConnection(connectionConfig);

    const treinamentos_arr: Array<any> = [], info_arr: Array<any> = [], aulas_arr: Array<any> = [], info_arr2: Array<any> = [];

    const [alunos, fields]: Array<any> = await connection.execute("SELECT id FROM alunos");
    const [instrutores, fields2]: Array<any> = await connection.execute("SELECT id FROM instrutores");
    const [treinamentos, fields3]: Array<any> = await connection.execute("SELECT id FROM cursos");

    const [controle, fields4]: Array<any> = await connection.execute("SELECT * FROM instrutores_cursos WHERE instrutor_id = ?", [req.session!.adminlogin.id]);
    for (let i = 0; i < controle.length; i++) {
      const curso_id = controle[i].curso_id;

      const [treinamentos, fields]: Array<any> = await connection.execute("SELECT * FROM cursos WHERE id = ?", [curso_id]);
      for (let j = 0; j < treinamentos.length; j++) {
        treinamentos_arr.push(treinamentos[j]);
      }

      const [aulas, fields5]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ? LIMIT 3", [curso_id]);
      for (let j = 0; j < aulas.length; j++) {
        aulas_arr.push(aulas[j]);
      }
    }

    for (let i = 0; i < treinamentos_arr.length; i++) {
      let curso_id: number = treinamentos_arr[i].id;
      const [total, fields2]: Array<any> = await connection.execute('SELECT * FROM cursos_aulas WHERE curso_id = ?', [curso_id]);
      const [modulos, fields]: Array<any> = await connection.execute("SELECT * FROM cursos_modulos WHERE curso_id = ?", [curso_id]);

      info_arr.push({
        _curso: treinamentos_arr[i],
        _total: total.length,
        _modulos: modulos.length,
      });
    }

    for (let i = 0; i < aulas_arr.length; i++) {
      let aula_id: number = aulas_arr[i].id;
      let curso_id: number = aulas_arr[i].curso_id;
      let modulo_id: number = aulas_arr[i].modulo_id;
      const [modulo, fields]: Array<any> = await connection.execute("SELECT * FROM cursos_modulos WHERE id = ?", [modulo_id]);
      const [treinamento, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos WHERE id = ?", [curso_id]);

      info_arr2.push({
        _aula: aulas_arr[i],
        _modulo: modulo[0].nome,
        _treinamento: treinamento[0].titulo
      })
    }

    res.render("admin/home", {
      adminlogin: req.session!.adminlogin,
      alunos: alunos.length,
      instrutores: instrutores.length,
      treinamentos: treinamentos.length,
      _cursos: info_arr,
      _aulas: info_arr2
    });
  }

  if (req.session!.adminlogin) {
    main();
  } else {
    res.redirect("/admin/login")
  }
}

export function login(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.redirect("/admin/");
  } else {
    res.render("admin/login");
  }
}

/* Páginas do Painel de Controle */
export function addtreinamento(req: Request, res: Response): void {
  async function main() {

    const connection = await createConnection(connectionConfig);

    const [categorias, fields]: Array<any> = await connection.execute("SELECT * FROM categorias");

    res.render("admin/cadastrar-treinamento", {
      adminlogin: req.session!.adminlogin,
      categorias: categorias
    });
  }

  if (req.session!.adminlogin) {
    main();
  } else {
    res.redirect("/admin/login")
  }
}

export function postaddtreinamento(req: Request, res: Response): void {
  async function main () {
    // const { treinamentoNome, treinamentoDescricao, treinamentoValor, treinamentoImagem } = req.body;
    
    const connection = await createConnection(connectionConfig);

    console.log(req);
    res.json({ request: req.body });
  }

  main();
}

export function addmodulo(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/cadastrar-modulo", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function addaula(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/cadastrar-aula", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function listtreinamentos(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/listar-treinamentos", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function listmodulos(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/listar-modulos", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function listaulas(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/listar-aulas", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function gerplataforma(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/gerenciar-plataforma", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function addinstrutores(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/cadastrar-instrutores", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function alncadastrados(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/alunos-cadastrados", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function edtusuario(req: Request, res: Response): void {
  if (req.session!.adminlogin) {
    res.render("admin/editar-usuario", {
      adminlogin: req.session!.adminlogin
    });
  } else {
    res.redirect("/admin/login")
  }
}

export function postaddmodulo(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postaddaula(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postlisttreinamentos(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postlistmodulos(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postlistaulas(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postgerplataforma(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postaddinstrutores(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postalncadastrados(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function postedtusuario(req: Request, res: Response): void { res.json({ page: req.url, method: "post", postHour: new Date().toLocaleDateString() }) }

export function logout(req: Request, res: Response): void {
  req.session!.adminlogin = undefined;
  res.redirect("/admin");
}

export function postlogin(req: Request, res: Response): void {
  async function main() {
    var {
      adminCPF,
      adminPassword
    } = req.body;

    const formatedAdminCPF = Validator.cpf.format(adminCPF);

    db.query("SELECT * FROM instrutores WHERE cpf = ? AND senha = ?", [formatedAdminCPF, adminPassword], (err, rows: any) => {
      if (!rows.length) {
        res.redirect("/admin/login");
      } else {
        req.session!.adminlogin = {
          id: rows[0].id,
          nome: rows[0].nome,
          email: rows[0].email,
          senha: rows[0].senha
        };
        res.redirect("/admin");
      }
    });
  }

  main();
}

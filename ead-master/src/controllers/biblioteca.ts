import db from "../utils/database"; // Database connection without promises
import * as Utils from "../utils/functions"; // For courses percentage
import { createConnection } from "mysql2/promise"; // Create Connection with database
import { Request, Response } from "express"; // Express mobule
import { host, user, database, password, port } from "../utils/config"; // For database connection

declare module "express-session" {
  interface SessionData {
    login: {
      id: number,
      name: string,
      email: string,
      password: string
    }
  }
};

const connectionConfig: object = { host, user, password, database, port };

export function biblioteca(req: Request, res: Response): void {
  async function main() {
    var cursos_arr = [], info_arr = [];

    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [controle, fields]: Array<any> = await connection.execute("SELECT * FROM controle_cursos WHERE aluno_id = ? ORDER BY curso_id", [req.session!.login.id]);

    for (let i = 0; i < controle.length; i++) {
      let id: number = controle[i].curso_id;
      const [cursos, fields]: Array<any> = await connection.execute("SELECT * FROM cursos WHERE id = ? ORDER BY id ASC", [id]);
      for (let j = 0; j < cursos.length; j++) {
        cursos_arr.push(cursos[j]);
      }
    }

    for (let i = 0; i < cursos_arr.length;  i++) {
      let curso_id: number = cursos_arr[i].id;
      const [total, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [curso_id]);
      const [assistidas, fields]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [curso_id]);
      const porcentagem: number = Utils.percentage(assistidas.length, total.length);
      const link: string = Utils.convertSlug(cursos_arr[i].nome);
      const emissao: Boolean = porcentagem == 100 ? true : false;

      info_arr.push({
        _curso: cursos_arr[i],
        _total: total.length,
        _assistidas: assistidas.length,
        _porcentagem: porcentagem,
        _link: link,
        _emissao: emissao
      });
    }

    res.render("biblioteca", { login: req.session!.login, _cursos: info_arr });
  }

  if (req.session!.login) {
    main();
  } else {
    res.redirect("/login?goto=biblioteca");
  }
}

export function treinamento(req: Request, res: Response): void {
  const curso_slug: string = req.url.split("/")[2];

  async function main() {
    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [course, fields1]: Array<any> = await connection.execute("SELECT id FROM cursos WHERE slug = ?", [curso_slug]);
    if (course.length == 0) {
      return res.json({ message: "Este curso não existe." });
    }

    const course_id: number = course[0].id;  
    
    const [controle, fields]: Array<any> = await connection.execute("SELECT id FROM controle_cursos WHERE aluno_id = ? AND curso_id = ?", [req.session!.login.id, course_id]);
    if (controle.length == 0) {
      return res.json({ message: "O aluno não possui o curso." });
    } 

    const [all_classes, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [course_id]);
    const [finished_classes, fields3]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [course_id]);

    if (all_classes.length == finished_classes.length) {
      // return res.redirect("/biblioteca/" + curso_slug + "/" + all_classes[0].slug);
      return res.json({ redirect: "/biblioteca/" + curso_slug + "/" + all_classes[0].slug });
    }

    if (all_classes[finished_classes.length] != undefined) {
      // return res.redirect("/biblioteca/" + curso_slug + "/" + all_classes[finished_classes.length].slug);
      return res.json({ redirect: "/biblioteca/" + curso_slug + "/" + all_classes[finished_classes.length].slug });
    }
  }

  if (req.session!.login) {
    main();
  } else {
    res.redirect("/login?goto=biblioteca/" + curso_slug + "/");
  }
}

export function aula(req: Request, res: Response): void {
  const curso_slug: string = req.url.split("/")[2], aula_slug: string = req.url.split("/")[3];
  var modules_arr: Array<any> = [], classes_arr: Array<any> = [];

  async function main() {
    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [course, fields1]: Array<any> = await connection.execute("SELECT id FROM cursos WHERE slug = ?", [curso_slug]);
    if (course.length == 0) {
      return res.json({ message: "Este curso não existe." });
    }

    const course_id: number = course[0].id;  
    
    const [controle, fields]: Array<any> = await connection.execute("SELECT id FROM controle_cursos WHERE aluno_id = ? AND curso_id = ?", [req.session!.login.id, course_id]);
    if (controle.length == 0) {
      return res.json({ message: "O aluno não possui o curso." });
    }

    const [modules, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos_modulos WHERE curso_id = ?", [course_id]);
    for (let i = 0; i < modules.length; i++) {
      modules_arr.push(modules[i]);
    }

    for (let i = 0; i < modules_arr.length; i++) {
      const module_id: number = modules_arr[i].id;
      const [classes, fields]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE modulo_id = ? AND curso_id = ?", [module_id, course_id]);
      for (let j = 0; j < classes.length; j++) {
        classes_arr.push(classes[j]);
      }
    }

    const [all_classes, fields4]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [course_id]);
    const [finished_classes, fields5]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [course_id]);

    var atual;

    for (let i = 0; i < all_classes.length; i++) {
      const class_slug = all_classes[i].slug;

      if (class_slug == aula_slug) {
        atual = all_classes[i];
      }
    }

    return res.json({ aula: atual.nome })
  }

  if (req.session!.login) {
    main();
  } else {
    res.redirect("/login?goto=biblioteca/" + curso_slug + "/" + aula_slug);
  }
}

export function concluir(req: Request, res: Response): void {
  const curso_slug: string = req.url.split("/")[2], aula_slug: string = req.url.split("/")[3];
  async function main() {
    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [course, fields1]: Array<any> = await connection.execute("SELECT id FROM cursos WHERE slug = ?", [curso_slug]);
    if (course.length == 0) return res.json({ message: "Este curso não existe." });

    const course_id: number = course[0].id;
    const [controle, fields]: Array<any> = await connection.execute("SELECT id FROM controle_cursos WHERE aluno_id = ? AND curso_id = ?", [1, course_id]);
    if (controle.length == 0) return res.json({ message: "O aluno não possui o curso." });

    const [cur_class, fields5]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ? AND slug = ?", [course_id, aula_slug]);
    if (cur_class.length == 0) return res.json({ message: "Esta aula não existe." });

    const [all_classes, fields4]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [course_id]);
    const [finished_classes, fields6]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [course_id]);

    var atual;

    for (let i = 0; i < all_classes.length; i++) if (all_classes[i].slug == aula_slug) atual = all_classes[i];

    for (let i = 0; i < finished_classes.length; i++) if (cur_class[0].id == finished_classes[i].aula_id) return res.json({ message: "Esta aula já foi concluída." });

    return res.json({ message: "Concluir aula." });
  }
  
  main();
}

export function emitir(req: Request, res: Response): void {
  async function main() {
    var cursos_arr = [], info_arr = [];

    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [controle, fields]: Array<any> = await connection.execute("SELECT * FROM controle_cursos WHERE aluno_id = ? ORDER BY curso_id", [req.session!.login.id]);

    for (let i = 0; i < controle.length; i++) {
      let id: number = controle[i].curso_id;
      const [cursos, fields]: Array<any> = await connection.execute("SELECT * FROM cursos WHERE id = ? ORDER BY id ASC", [id]);
      for (let j = 0; j < cursos.length; j++) {
        cursos_arr.push(cursos[j]);
      }
    }

    for (let i = 0; i < cursos_arr.length;  i++) {
      let curso_id: number = cursos_arr[i].id;
      const [total, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [curso_id]);
      const [assistidas, fields]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [curso_id]);
      const porcentagem: number = Utils.percentage(assistidas.length, total.length);

      if (porcentagem == 100) {
        info_arr.push({
          _curso: cursos_arr[i],
          _total: total.length,
          _assistidas: assistidas.length,
          _porcentagem: porcentagem,
        });
      }
    }

    res.render("emitir", { login: req.session!.login, _cursos: info_arr });
  }

  if (req.session!.login) {
    main();
  } else {
    res.redirect("/login?goto=biblioteca/emitir");
  }
}

export function emitirCurso(req: Request, res: Response): void {
  const curso_slug: string = req.url.split("/")[3];

  async function main() {
    var cursos_arr = [], info_arr = [];

    var connection;

    try {
      connection = await createConnection(connectionConfig);
    } catch (err) {
      throw err;
    }

    const [course, fields1]: Array<any> = await connection.execute("SELECT id FROM cursos WHERE slug = ?", [curso_slug]);
    if (course.length == 0) {
      return res.json({ message: "Este curso não existe." });
    }

    const course_id: number = course[0].id;  
    
    // const [controle, fields]: Array<any> = await connection.execute("SELECT id FROM controle_cursos WHERE aluno_id = ? AND curso_id = ?", [req.session!.login.id, course_id]);
    const [controle, fields]: Array<any> = await connection.execute("SELECT id FROM controle_cursos WHERE aluno_id = ? AND curso_id = ?", [1, course_id]);
    if (controle.length == 0) {
      return res.json({ message: "O aluno não possui o curso." });
    }

    const [all_classes, fields2]: Array<any> = await connection.execute("SELECT * FROM cursos_aulas WHERE curso_id = ?", [course_id]);
    const [finished_classes, fields3]: Array<any> = await connection.execute("SELECT * FROM aulas_assistidas WHERE curso_id = ?", [course_id]);

    if (all_classes.length != finished_classes.length) {
      return res.json({ message: "Você não pode emitir um certificado de um curso não concluído." });
    }

    return res.json({ message: "Página para emitir certificado" });
  }

  // if (req.session!.login) {
    main();
  // } else {
    // res.redirect("/login?goto=biblioteca/emitir/" + curso_slug);
  // }
}
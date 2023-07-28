import { Router } from "express";
import * as AdminController from "../controllers/admin";
import multer from "multer";
import { multerConfig } from "../config/multer";
const router = Router();

router.get("/admin", AdminController.home);
router.get("/admin/login", AdminController.login);
router.post("/admin/login", AdminController.postlogin);
router.get("/admin/sair", AdminController.logout);

/* Páginas do Painel de Controle */
router.get("/admin/cadastrar-treinamento", multer(multerConfig).single("treinamentoImagem"), AdminController.addtreinamento);
router.get("/admin/cadastrar-modulo", AdminController.addmodulo);
router.get("/admin/cadastrar-aula", AdminController.addaula);
router.get("/admin/listar-treinamentos", AdminController.listtreinamentos);
router.get("/admin/listar-modulos", AdminController.listmodulos);
router.get("/admin/listar-aulas", AdminController.listaulas);
router.get("/admin/gerenciar-plataforma", AdminController.gerplataforma);
router.get("/admin/cadastrar-instrutores", AdminController.addinstrutores);
router.get("/admin/alunos-cadastrados", AdminController.alncadastrados);
router.get("/admin/editar-usuario", AdminController.edtusuario);

router.post("/admin/cadastrar-treinamento", AdminController.postaddtreinamento);
router.post("/admin/cadastrar-modulo", AdminController.postaddmodulo);
router.post("/admin/cadastrar-aula", AdminController.postaddaula);
router.post("/admin/listar-treinamentos", AdminController.postlisttreinamentos);
router.post("/admin/listar-modulos", AdminController.postlistmodulos);
router.post("/admin/listar-aulas", AdminController.postlistaulas);
router.post("/admin/gerenciar-plataforma", AdminController.postgerplataforma);
router.post("/admin/cadastrar-instrutores", AdminController.postaddinstrutores);
router.post("/admin/alunos-cadastrados", AdminController.postalncadastrados);
router.post("/admin/editar-usuario", AdminController.postedtusuario);

export default router;
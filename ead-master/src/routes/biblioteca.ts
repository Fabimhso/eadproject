import express from "express";
import * as LibController from "../controllers/biblioteca";

const router = express.Router();

router.get("/biblioteca", LibController.biblioteca)
router.get("/biblioteca/emitir/", LibController.emitir);
router.get("/biblioteca/emitir/:curso", LibController.emitirCurso);
router.get("/biblioteca/:tslug", LibController.treinamento);
router.get("/biblioteca/:tslug/:aslug", LibController.aula);
router.get("/biblioteca/:tslug/:aslug/concluir", LibController.concluir);
// router.get("/biblioteca/:tslug/:aslug/desconcluir", LibController.desconcluir);

export default router;
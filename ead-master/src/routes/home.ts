import express from 'express';
import * as Controller from '../controllers/home';

const router = express.Router();

router.get('/', Controller.home)
router.get('/loja', Controller.loja)
router.get('/certificados', Controller.certificados)
router.get('/contato', Controller.contato)
router.get('/conta', Controller.conta)

// router.get('/debug', controller.debug)
router.get('/login', Controller.login)
router.get('/register', Controller.register)
router.get('/sair', Controller.logout)

router.post('/login', Controller.postlogin)
router.post('/register', Controller.postregister)

export default router;
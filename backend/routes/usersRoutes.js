import express from 'express';
import { getUsers, getUser, addUser, editUser, removeUser } from '../controllers/usersController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.put('/:id', editUser);
router.delete('/:id', removeUser);

export default router;

import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../models/usersModel.js';

export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('getUsers error', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function addUser(req, res) {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error('addUser error', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function editUser(req, res) {
  try {
    const id = Number(req.params.id);
    const user = await updateUser(id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('editUser error', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function removeUser(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteUser(id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('removeUser error', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

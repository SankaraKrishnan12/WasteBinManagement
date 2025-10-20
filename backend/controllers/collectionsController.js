import { getAllCollections, getCollectionById, createCollection, updateCollection, deleteCollection } from '../models/collectionsModel.js';

export async function getCollections(req, res) {
  try {
    const collections = await getAllCollections();
    res.json(collections);
  } catch (err) {
    console.error('getCollections error', err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
}

export async function getCollection(req, res) {
  try {
    const id = Number(req.params.id);
    const collection = await getCollectionById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    console.error('getCollection error', err);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
}

export async function addCollection(req, res) {
  try {
    const collection = await createCollection(req.body);
    res.status(201).json(collection);
  } catch (err) {
    console.error('addCollection error', err);
    res.status(500).json({ error: 'Failed to create collection' });
  }
}

export async function editCollection(req, res) {
  try {
    const id = Number(req.params.id);
    const collection = await updateCollection(id, req.body);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    console.error('editCollection error', err);
    res.status(500).json({ error: 'Failed to update collection' });
  }
}

export async function removeCollection(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteCollection(id);
    if (!result) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error('removeCollection error', err);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
}

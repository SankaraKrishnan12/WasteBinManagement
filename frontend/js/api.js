const BASE_URL = "http://localhost:5000/api";

export async function getHouseholds() {
  const res = await fetch(`${BASE_URL}/households`);
  return res.json();
}

export async function getBins() {
  const res = await fetch(`${BASE_URL}/bins`);
  return res.json();
}

export async function getFarHouseholds() {
  const res = await fetch(`${BASE_URL}/analysis/far-households`);
  return res.json();
}

export async function suggestBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggest`, { method: "POST" });
  return res.json();
}

// New API functions for enriched entities
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

export async function getVehicles() {
  const res = await fetch(`${BASE_URL}/vehicles`);
  return res.json();
}

export async function getCollections() {
  const res = await fetch(`${BASE_URL}/collections`);
  return res.json();
}

export async function getSensors() {
  const res = await fetch(`${BASE_URL}/sensors`);
  return res.json();
}

export async function getMaintenance() {
  const res = await fetch(`${BASE_URL}/maintenance`);
  return res.json();
}

export async function getRoutes() {
  const res = await fetch(`${BASE_URL}/routes`);
  return res.json();
}

export async function getWasteTypes() {
  const res = await fetch(`${BASE_URL}/waste-types`);
  return res.json();
}

export async function getAssignments() {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
}

export async function getSuggestedBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggested`);
  return res.json();
}

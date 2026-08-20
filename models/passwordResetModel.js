const fs = require("fs");
const path = require("path");

const requestsFilePath = path.join(__dirname, "..", "data", "passwordResetRequests.json");

const readRequests = () => {
  const raw = fs.readFileSync(requestsFilePath, "utf-8");
  return JSON.parse(raw);
};

const writeRequests = (requests) => {
  fs.writeFileSync(requestsFilePath, JSON.stringify(requests, null, 2));
};

const getAllRequests = () => readRequests();

const getPendingRequests = () => {
  return readRequests()
    .filter((request) => request.status === "pending")
    .sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt));
};

const getResolvedRequests = (limit = 10) => {
  return readRequests()
    .filter((request) => request.status !== "pending")
    .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))
    .slice(0, limit);
};

const createRequest = (email) => {
  const requests = readRequests();
  const request = {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    status: "pending",
    requestedAt: new Date().toISOString(),
    resolvedAt: null,
    tempPassword: null,
  };
  requests.push(request);
  writeRequests(requests);
  return request;
};

const findRequestById = (id) => {
  return readRequests().find((request) => request.id === id) || null;
};

const resolveRequest = (id, tempPassword) => {
  const requests = readRequests();
  const index = requests.findIndex((request) => request.id === id);

  if (index === -1) {
    return null;
  }

  requests[index] = {
    ...requests[index],
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    tempPassword,
  };
  writeRequests(requests);
  return requests[index];
};

const rejectRequest = (id) => {
  const requests = readRequests();
  const index = requests.findIndex((request) => request.id === id);

  if (index === -1) {
    return null;
  }

  requests[index] = {
    ...requests[index],
    status: "rejected",
    resolvedAt: new Date().toISOString(),
  };
  writeRequests(requests);
  return requests[index];
};

const deleteRequest = (id) => {
  const requests = readRequests();
  const index = requests.findIndex((request) => request.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = requests.splice(index, 1);
  writeRequests(requests);
  return deleted;
};

module.exports = {
  getAllRequests,
  getPendingRequests,
  getResolvedRequests,
  createRequest,
  findRequestById,
  resolveRequest,
  rejectRequest,
  deleteRequest,
};

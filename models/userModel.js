const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "..", "data", "users.json");

const readUsers = () => {
  const raw = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(raw);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const getAllUsers = () => readUsers();

const findUserByEmail = (email) => {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((user) => user.email.toLowerCase() === normalized) || null;
};

const findUserById = (id) => {
  return readUsers().find((user) => user.id === id) || null;
};

const updateUser = (id, updates) => {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return null;
  }

  users[index] = { ...users[index], ...updates };
  writeUsers(users);
  return users[index];
};

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  updateUser,
};

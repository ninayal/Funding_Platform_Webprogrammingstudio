const bcrypt = require("bcryptjs");

const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

const generateTempPassword = (length = 10) => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += TEMP_PASSWORD_CHARS.charAt(Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length));
  }
  return result;
};

const hashPassword = (plainPassword) => bcrypt.hashSync(plainPassword, 10);

const verifyPassword = (plainPassword, passwordHash) => bcrypt.compareSync(plainPassword, passwordHash);

module.exports = {
  generateTempPassword,
  hashPassword,
  verifyPassword,
};

const crypto = require("crypto");

const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

const SCRYPT_KEYLEN = 64;

const generateTempPassword = (length = 10) => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += TEMP_PASSWORD_CHARS.charAt(Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length));
  }
  return result;
};

// Same "scrypt$<saltHex>$<hashHex>" format as models/userModel.js on main,
// so hashes stay interchangeable between the two user models.
const hashPassword = (plainPassword) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(plainPassword), salt, SCRYPT_KEYLEN);
  return ["scrypt", salt.toString("hex"), hash.toString("hex")].join("$");
};

const verifyPassword = (plainPassword, passwordHash) => {
  try {
    const [algorithm, saltHex, hashHex] = String(passwordHash || "").split("$");

    if (algorithm !== "scrypt" || !saltHex || !hashHex) {
      return false;
    }

    const calculatedHash = crypto.scryptSync(String(plainPassword), Buffer.from(saltHex, "hex"), SCRYPT_KEYLEN);
    const storedHash = Buffer.from(hashHex, "hex");

    return calculatedHash.length === storedHash.length && crypto.timingSafeEqual(calculatedHash, storedHash);
  } catch {
    return false;
  }
};

module.exports = {
  generateTempPassword,
  hashPassword,
  verifyPassword,
};

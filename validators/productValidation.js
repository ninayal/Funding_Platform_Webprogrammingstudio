const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_WORDS = 3000;

const countWords = (text) =>
  (text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

const validateProduct = (fields) => {
  const errors = [];
  const warnings = [];

  const title =
    String(fields.title || "").trim();

  const description =
    String(fields.description || "").trim();

  const category =
    String(fields.category || "").trim();

  const material =
    String(fields.material || "").trim();

  const craftVillage =
    String(fields.craftVillage || "").trim();

  const price =
    Number(fields.price);

  const weightGram =
    Number(fields.weightGram);

  const stock =
    Number(fields.stock);

  const images =
    (fields.images || [])
      .map((url) =>
        String(url || "").trim()
      )
      .filter(Boolean);

  if (!title) {
    errors.push(
      "Product name is required."
    );
  } else if (
    title.length > TITLE_MAX_LENGTH
  ) {
    errors.push(
      `Product name must be ${TITLE_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!category) {
    errors.push(
      "Product category is required."
    );
  }

  if (!description) {
    errors.push(
      "Product description is required."
    );
  } else if (
    countWords(description) >
    DESCRIPTION_MAX_WORDS
  ) {
    errors.push(
      `Product description must be ${DESCRIPTION_MAX_WORDS} words or fewer.`
    );
  }

  if (!material) {
    errors.push(
      "Material is required."
    );
  }

  if (!craftVillage) {
    errors.push(
      "Craft village is required."
    );
  }

  if (!images.length) {
    errors.push(
      "A cover image is required."
    );
  }

  if (
    fields.price === undefined ||
    fields.price === "" ||
    Number.isNaN(price) ||
    price <= 0
  ) {
    errors.push(
      "Price must be greater than 0."
    );
  }

  if (
    fields.weightGram === undefined ||
    fields.weightGram === "" ||
    Number.isNaN(weightGram) ||
    weightGram <= 0
  ) {
    errors.push(
      "Product weight must be greater than 0."
    );
  }

  if (
    fields.stock === undefined ||
    fields.stock === "" ||
    Number.isNaN(stock) ||
    stock < 0 ||
    !Number.isInteger(stock)
  ) {
    errors.push(
      "Available quantity must be a whole number of 0 or more."
    );
  }

  return {
    errors,
    warnings
  };
};

module.exports = {
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_WORDS,
  validateProduct
};

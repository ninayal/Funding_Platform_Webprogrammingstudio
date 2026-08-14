const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_WORDS = 3000;

const TITLE_BLACKLIST = [
  "siêu giảm giá",
  "giá tại xưởng",
  "hàng nóng bỏng tay",
  "bán chạy nhất",
  "miễn phí vận chuyển",
  "freeship",
  "giảm giá",
  "bao giá sỉ",
];

const TITLE_PRICE_PATTERN = /\d[\d.,]*\s*(k|đ|vnd)\b/i;

// Strips Vietnamese diacritics so the blacklist still catches "khong dau" (unaccented) typing.
const stripDiacritics = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const CONTACT_PATTERNS = [
  /(0|\+84)[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4}/, // VN phone number
  /\b(zalo|facebook|fb|messenger|tele(gram)?)\b/i, // external contact channels
  /https?:\/\/|www\.|\.(com|vn|net|shop)\b/i, // outbound links
];

const countWords = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;

const validateProduct = (fields) => {
  const errors = [];
  const warnings = [];

  const title = (fields.title || "").trim();
  const description = (fields.description || "").trim();
  const category = (fields.category || "").trim();
  const price = Number(fields.price);
  const weightGram = Number(fields.weightGram);
  const stock = Number(fields.stock);
  const images = (fields.images || []).map((url) => (url || "").trim()).filter(Boolean);

  if (!title) {
    errors.push("Product title is required.");
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.push(`Title must be ${TITLE_MAX_LENGTH} characters or fewer (currently ${title.length}).`);
  } else {
    const normalizedTitle = stripDiacritics(title.toLowerCase());
    const matchedBlacklist = TITLE_BLACKLIST.find((word) => normalizedTitle.includes(stripDiacritics(word)));
    if (matchedBlacklist) {
      errors.push(`Title contains a promotional phrase that isn't allowed: "${matchedBlacklist}".`);
    }
    if (TITLE_PRICE_PATTERN.test(title)) {
      errors.push("Title must not contain a price (e.g. \"199k\", \"199.000đ\").");
    }
    if (/[a-zà-ỹ]/i.test(title) && title === title.toUpperCase()) {
      warnings.push("Title is fully uppercase — consider capitalizing only the first letter.");
    }
  }

  if (!category) {
    errors.push("Category is required.");
  }

  if (!description) {
    errors.push("Description is required.");
  } else {
    const wordCount = countWords(description);
    if (wordCount > DESCRIPTION_MAX_WORDS) {
      errors.push(`Description must be ${DESCRIPTION_MAX_WORDS} words or fewer (currently ${wordCount}).`);
    }
    const matchedContact = CONTACT_PATTERNS.find((pattern) => pattern.test(description));
    if (matchedContact) {
      errors.push("Description must not contain a phone number, Zalo/Facebook mention, or outside link.");
    }
  }

  if (images.length === 0) {
    errors.push("At least one product image is required.");
  }

  if (!fields.price || Number.isNaN(price) || price <= 0) {
    errors.push("Price must be a number greater than 0.");
  }

  if (!fields.weightGram || Number.isNaN(weightGram) || weightGram <= 0) {
    errors.push("Packed weight (grams) must be a number greater than 0.");
  }

  if (fields.stock === undefined || fields.stock === "" || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.push("Stock must be a whole number of 0 or more.");
  }

  return { errors, warnings };
};

module.exports = {
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_WORDS,
  validateProduct,
};

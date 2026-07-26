const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).send(message);
};

module.exports = errorHandler;
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.log(`[Error] ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

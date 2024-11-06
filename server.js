const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const { logger, morganMiddleware } = require("./logs/winston");
const routes = require("./routes/setup");
const { logMiddleware, errorHandlerMiddleware } = require("./logs/custom");
//load env vars
dotenv.config({ path: "./config/config.env" });
//initialise express
const app = express();

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));
//Set Security Headers

//Prevent XSS Attack

if (process.env.NODE_ENV === "development") {
  app.use(logMiddleware);
}

app.use(function (req, res, next) {
  res.removeHeader("x-powered-by");
  res.removeHeader("set-cookie");
  res.removeHeader("Date");
  res.removeHeader("Connection");

  next();
});
app.use(function (req, res, next) {
  /* Clickjacking prevention */
  res.header("Content-Security-Policy", "frame-ancestors directive");
  next();
});

//Mount local routes
app.use("/api/v1", routes);

app.use(errorHandler);
// Error-handling middleware must be last
// app.use(errorHandlerMiddleware);
//errror middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: 0,
    message: error.message,
  });
  logger.error(error.message);
});
//create port
const PORT = process.env.PORT || 9000;
//listen to portnpm
app.listen(PORT, () => {
  console.log(
    `API: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
  );
  logger.debug(
    `API: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
  );
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  logger.error(err.message);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

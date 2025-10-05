const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const AppError = require("./starter/utils/appError");

const toursRouter = require("./starter/routes/toursRoutes");
const usersRouter = require("./starter/routes/usersRoutes");
const globalErrorHandler = require("./starter/controllers/globalErrorController");
app.use(cookieParser());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Muitas requisições. Tente novamente em 1 hora!",
});

app.use("/api", limiter);
app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.originalUrl}`);
  next(); // Não se esqueça do next() para passar a requisição para o próximo middleware/rota
});
// Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//só  usar o morgan se for nesse modo de desenvolvimento

app.use(express.json());

app.use("/api/v1/tours", toursRouter);
///POR AGORA NÃO VAMOS IMPLEMENTAR POIS É MUITO PARECIDO COM A DINÂMICA DO TOUR E TBM PQ NÃO COMEÇAMOS A UTILIZAR INFORMAÇÕES REAIS COM BANCO DE DADOS
app.use("/api/v1/users", usersRouter);
////////////////////////////////////////////////
app.all("*", (req, res, next) => {
  next(new AppError(404, `Não achamos ${req.originalUrl}`));
});

app.use(globalErrorHandler);
module.exports = app;

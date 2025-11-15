const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const app = express();
const path = require("path");
const AppError = require("./starter/utils/appError");
const toursRouter = require("./starter/routes/toursRoutes");
const usersRouter = require("./starter/routes/usersRoutes");
const viewsRouter = require("./starter/routes/viewsRoutes");
const reviewsRouter = require("./starter/routes/reviewsRoutes");
const globalErrorHandler = require("./starter/controllers/globalErrorController");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

//adicionando comentarios aquii

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/starter/views"));
app.use(express.static(path.join(__dirname, "starter", "public")));
//segurança de http headers
// Configuração do Helmet com CSP personalizado
app.use(
  helmet({
    contentSecurityPolicy: false, // 🔓 desativa CSP por completo
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Muitas requisições. Tente novamente em 1 hora!",
});
app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//só  usar o morgan se for nesse modo de desenvolvimento

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// Middleware

//higieização mais BÁSICA de dados contra ataques comuns: No sql injection/ cross-site xss (que usam injeção de código via inputs: primeiro caso é código mongo, segundo é scripts html/js)
//OBS: depois no final do curso faremos uma proteção mais avançada no código
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "startDates",
      "duration",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.originalUrl}`);
  console.log(req.cookies);
  next(); // Não se esqueça do next() para passar a requisição para o próximo middleware/rota
});
app.use(
  cors({
    origin: "http://127.0.0.1:8000", // ou o domínio do seu front se for diferente
    credentials: true, // 🔥 permite o envio de cookies entre client/server
  })
);
app.use("/", viewsRouter);
app.use("/api/v1/tours", toursRouter);
///POR AGORA NÃO VAMOS IMPLEMENTAR POIS É MUITO PARECIDO COM A DINÂMICA DO TOUR E TBM PQ NÃO COMEÇAMOS A UTILIZAR INFORMAÇÕES REAIS COM BANCO DE DADOS
app.use("/api/v1/users", usersRouter);
////////////////////////////////////////////////
app.use("/api/v1/reviews", reviewsRouter);

app.all("*", (req, res, next) => {
  next(new AppError(404, `Não achamos ${req.originalUrl}`));
});

app.use(globalErrorHandler);
module.exports = app;

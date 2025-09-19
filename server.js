require("dotenv").config({ path: "./config.env" });

const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB ESTÁ CONECTADO");
  });

const app = require("./app");

const server = app.listen(process.env.PORT, () => {
  console.log("app rodando na porta 8000");
});

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection:");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException:");
  console.log(err.name, err.message);

  process.exit(1);
});

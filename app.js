// Carregando módulos
const express = require("express");
const app = express();
const admin = require("./routes/admin"); // Pegando a rota admin (é assim que se usa rotas em arquivo externo)

const handlebars = require("express-handlebars"); // Template Engine
const bodyParser = require("body-parser"); // Pega informações do formulário
const mongoose = require("mongoose"); // Gerencia a conexão com o banco de dados
const path = require("path"); // Define pastas que serão usadas (como por exemplo CSS externo)

const session = require("express-session");
const flash = require("connect-flash");

// Configurações
// Sessão
app.use(session({
  secret: "cursodenodejs",
  resave: true,
  saveUnitialized: true
}));
app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Pastas publicas (falando onde estão minhas pastas de css e js)
app.use(express.static(path.join(__dirname, "public")));

// Configurando Body Parser (pega informações do formulário)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser(bodyParser.json()));

// Configurando handlebars (Template Engine)
app.engine("handlebars", handlebars({
  defaultLayout: "main",
  // helpers: require("./public/js/helpers.js").helpers, // same file that gets used on our client
  // partialsDir: "views/partials/", // same as default, I just like to be explicit
  // layoutsDir: "views/layouts/" // same as default, I just like to be explicit
}));
app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
  console.log("Conexão feita com sucesso.");
}).catch((err) => {
  console.log("Erro ao se conectar. Erro: " + err);
});

// Rotas (routes)
app.use("/admin", admin);

const port = 8081;
app.listen(port, () => {
  console.log(`Servidor rodando em: http://localhost:${port}`);
});

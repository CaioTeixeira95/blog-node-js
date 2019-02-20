// Carregando módulos
const express = require("express");
const app = express();
const admin = require("./routes/admin"); // Pegando a rota admin (é assim que se usa rotas em arquivo externo)
const usuario = require("./routes/usuario");

const handlebars = require("express-handlebars"); // Template Engine
const bodyParser = require("body-parser"); // Pega informações do formulário
const mongoose = require("mongoose"); // Gerencia a conexão com o banco de dados
const path = require("path"); // Define pastas que serão usadas (como por exemplo CSS externo)
const passport = require("passport");
require("./config/auth")(passport);
const db = require("./config/db");

// Variáveis de sessão
const session = require("express-session");
const flash = require("connect-flash");

// Importando os Models
require("./models/Postagem");
require("./models/Categoria");
require("./models/Usuario");

// Variáveis dos Models
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");
const Usuario = mongoose.model("usuarios");

// Configurações
// Sessão
app.use(session({
  secret: "cursodenodejs",
  resave: true,
  saveUnitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // Mensagem de erro do Passport
  res.locals.user = req.user || null; // Usuario logado no sistema
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

// Mongoose (Configurando a conexão com o banco de dados)
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(() => {
  console.log("Conexão feita com sucesso.");
}).catch((err) => {
  console.log("Erro ao se conectar. Erro: " + err);
});

// Rotas (routes)
app.get("/", (req, res) => {
  Postagem.find().populate("categoria").sort({
    data: "desc"
  }).then((postagens) => {
    res.render("index", {
      postagens: postagens
    });
  }).catch(() => {
    req.flash("error_msg", "Houve um erro interno.");
    res.redirect("/404");
  });

});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({
    slug: req.params.slug
  }).then((postagem) => {
    if (postagem) {
      res.render("postagem/index", {
        postagem: postagem
      });
    } else {
      req.flash("error_msg", "Essa postagem não existe.");
      res.redirect("/");
    }
  }).catch(() => {
    req.flash("error_msg", "Houve um erro interno.");
    res.redirect("/");
  })
});

app.get("/categorias", (req, res) => {
  Categoria.find().then((categorias) => {
    res.render("categorias/index", {
      categorias: categorias
    });
  }).catch(() => {
    req.flash("error_msg", "Houve um erro ao listar as categorias.");
    res.redirect("/");
  });
});

app.get("/categorias/:slug", (req, res) => {

  Categoria.findOne({
    slug: req.params.slug
  }).then((categoria) => {
    if (categoria) {

      Postagem.find({
        categoria: categoria._id
      }).then((postagens) => {
        res.render("categorias/postagens", {
          postagens: postagens,
          categoria: categoria
        });
      }).catch(() => {
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/");
      });

    } else {

      req.flash("error_msg", "Esta categoria não existe.");
      res.redirect("/");

    }

  }).catch(() => {
    req.flash("error_msg", "Houve um erro ao carregar a página desta categoria.");
    res.redirect("/");
  });

});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.use("/admin", admin);
app.use("/usuarios", usuario);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Servidor rodando.`);
});

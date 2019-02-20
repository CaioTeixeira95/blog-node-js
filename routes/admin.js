const express = require("express");
const router = express.Router();

// Importando o Model de Categoria
const mongoose = require("mongoose");
require("../models/Categoria");
require("../models/Postagem");
const Categoria = mongoose.model("categorias");
const Postagem  = mongoose.model("postagens");

const {eAdmin} = require("../helpers/verifica_admin"); // Pegando apenas a função eAdmin

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", (req, res) => {
  res.send("Página de postagens.");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find().sort({
    date: 'desc'
  }).then((categorias) => {
    res.render("admin/categorias", {
      categorias: categorias
    });
  }).catch(() => {
    req.flash("error_msg", "Erro ao listar categorias.");
    res.redirect("/admin");
  });

});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {

  var erros = [];

  if (!req.body.nome || typeof(req.body.nome) == undefined || req.body.nome == null) {
    erros.push({
      texto: "Nome inválido."
    });
  }

  if (!req.body.slug || typeof(req.body.slug) == undefined || req.body.slug == null) {
    erros.push({
      texto: "Slug inválido."
    });
  }

  if (req.body.nome < 2) {
    erros.push({
      texto: "Nome da categoria muito pequeno."
    })
  }

  if (erros.length > 0) {

    res.render("admin/addcategorias", {
      erros: erros
    });

  } else {

    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() => {
      req.flash("success_msg", "Categoria cadastrada com sucesso.");
      res.redirect("/admin/categorias");
    }).catch((err) => {
      req.flash("error_msg", "Erro ao cadastrar categoria. Tente novamente.");
      res.redirect("/admin");
    });

  }

});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({
    _id: req.params.id
  }).then((categoria) => {
    res.render("admin/editcategorias", {
      categoria: categoria
    });
  }).catch((err) => {
    req.flash("error_msg", "Essa categoria não existe.");
    res.redirect("/admin/categorias");
  });
});

router.post("/categorias/edit", eAdmin, (req, res) => {

  var erros = [];

  if (!req.body.nome || typeof(req.body.nome) == undefined || req.body.nome == null) {
    erros.push({
      texto: "Nome inválido."
    });
  }

  if (!req.body.slug || typeof(req.body.slug) == undefined || req.body.slug == null) {
    erros.push({
      texto: "Slug inválido."
    });
  }

  if (req.body.nome < 2) {
    erros.push({
      texto: "Nome da categoria muito pequeno."
    })
  }

  if (erros.length > 0) {

    res.render("admin/addcategorias", {
      erros: erros
    });

  } else {

    Categoria.findOne({
      _id: req.body.id
    }).then((categoria) => {

      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso.");
        res.redirect("/admin/categorias");
      }).catch((err) => {
        req.flash("error_msg", "Houve erro interno ao salvar a categoria.");
        res.redirect("/admin/categorias");
      });

    }).catch((err) => {
      req.flash("error_msg", "Houve erro ao editar a categoria.");
      res.redirect("/admin/categorias");
    });

  }
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.remove({
    _id: req.body.id
  }).then(() => {
    req.flash("success_msg", "Categoria deletada com sucesso.");
    res.redirect("/admin/categorias");
  }).catch(() => {
    req.flash("error_msg", "Houve erro ao deletar a categoria.");
    res.redirect("/admin/categorias");
  });
});

router.get("/postagens", eAdmin, (req, res) => {

  Postagem.find().populate("categoria").sort({
    date: "desc"
  }).then((postagens) => {
    res.render("admin/postagens", {
      postagens: postagens
    });
  }).catch(() => {
    req.flash("error_msg", "Houve erro ao carregar postagens.");
    res.redirect("/admin");
  });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find().then((categorias) => {
    res.render("admin/addpostagem", {
      categorias: categorias
    });
  }).catch(() => {
    req.flash("error_msg", "Houve erro ao carregar formulário.");
    res.redirect("/admin");
  })
});

router.post("/postagens/nova", eAdmin, (req, res) => {

  var erros = [];

  if (!req.body.titulo || typeof(req.body.titulo) == undefined || req.body.titulo == null) {
    erros.push({
      texto: "Título inválido"
    });
  }

  if (!req.body.slug || typeof(req.body.slug) == undefined || req.body.slug == null) {
    erros.push({
      texto: "Slug inválido"
    });
  }

  if (!req.body.descricao || typeof(req.body.descricao) == undefined || req.body.descricao == null) {
    erros.push({
      texto: "Descrição inválida"
    });
  }

  if (req.body.categoria == 0) {
    erros.push({
      texto: "Nenhuma categoria cadastrada. <a class='text-decoration-none' href='/admin/addcategorias'>Clique aqui</a> para cadastrar."
    });
  }

  if(erros.length > 0){

    Categoria.find().then((categorias) => {
      res.render("admin/addpostagem", {
        categorias: categorias,
        erros: erros
      });
    }).catch(() => {
      req.flash("error_msg", "Houve erro ao carregar formulário.");
      res.redirect("/admin");
    });

  } else {

    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }

    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Categoria cadastrada com sucesso.");
      res.redirect("/admin/postagens");
    }).catch(() => {
      req.flash("error_msg", "Erro ao cadastrar postagens.");
      res.redirect("/admin/postagens");
    });

  }
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({
    _id: req.params.id
  }).populate("categoria").then((postagem) => {
    Categoria.find().then((categorias) => {
      res.render("admin/editpostagens", {
        postagem: postagem,
        categorias: categorias
      });
    }).catch(() => {
      req.flash("error_msg", "Erro ao carregar categorias.");
      res.redirect("/admin");
    });
  }).catch(() => {
    req.flash("error_msg", "Erro ao carregar formulário de edição.");
    res.redirect("/admin");
  });

});

router.post("/postagens/edit", eAdmin, (req, res) => {

  var erros = [];

  if (!req.body.titulo || typeof(req.body.titulo) == undefined || req.body.titulo == null) {
    erros.push({
      texto: "Título inválido"
    });
  }

  if (!req.body.slug || typeof(req.body.slug) == undefined || req.body.slug == null) {
    erros.push({
      texto: "Slug inválido"
    });
  }

  if (!req.body.descricao || typeof(req.body.descricao) == undefined || req.body.descricao == null) {
    erros.push({
      texto: "Descrição inválida"
    });
  }

  if (req.body.categoria == 0) {
    erros.push({
      texto: "Nenhuma categoria cadastrada."
    });
  }

  if(erros.length > 0){

    Postagem.findOne({
      _id: req.body.id
    }).then((postagem) => {
      Categoria.find().then((categorias) => {
        res.render("admin/editpostagens", {
          categorias: categorias,
          postagem: postagem,
          erros: erros
        });
      }).catch(() => {
        req.flash("error_msg", "Houve erro ao carregar categorias.");
        res.redirect("/admin");
      });
    }).catch(() => {
      req.flash("erros_msg", "Houve um erro ao carregar a postagem");
    });

  } else {

    Postagem.findOne({
      _id: req.body.id
    }).then((postagem) => {

      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem.save().then(() => {
        req.flash("success_msg", "Postagem alterada com sucesso.");
        res.redirect("/admin/postagens");
      }).catch((error) => {
        req.flash("error_msg", `Erro interno. Erro: ${erro}`);
        res.redirect("admin/postagens");
      });

    }).catch(() => {
      req.flash("error_msg", "Houve um erro ao editar a postagem.");
      res.redirect("admin/postagens");
    });

  }

});

router.post("/postagens/deletar", eAdmin, (req, res) => {
  Postagem.remove({
    _id: req.body.id
  }).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso.");
  }).catch(() => {
    req.flash("error_msg", "Houve um erro ao deletar a postagem.");
  });

  res.redirect("/admin/postagens");
})

module.exports = router;

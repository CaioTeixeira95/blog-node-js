const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport) {

  passport.use(new localStrategy({
      usernameField: "email",
      passwordField: "senha"
    },
    function(email, senha, done) {

      Usuario.findOne({
        email: email
      }).then((usuario) => {

        if (!usuario) {
          return done(null, false, {
            message: "Essa conta não existe."
          });
        }

        bcryptjs.compare(senha, usuario.senha, (erro, senhas_iguais) => {
          if (senhas_iguais) {
            return done(null, usuario);
          } else {
            return done(null, false, {
              message: "Senha incorreta! Tente novamente."
            });
          }
        });
      });

    }

  ));

  // Salvando os dados do usuário em uma sessão
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario);
    });
  });

}

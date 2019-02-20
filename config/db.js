if(process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: "mongodb+srv://caio_teixeira:caio1995@blog-node-js-hjyii.mongodb.net/test?retryWrites=true"
  }
} else {
  module.exports = {
    mongoURI: "mongodb://localhost/blogapp"
  }
}

if(process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: "mongodb+srv://<dbuser>:<password>@blog-node-js-hjyii.mongodb.net/test?retryWrites=true"
  }
} else {
  module.exports = {
    mongoURI: "mongodb://localhost/blogapp"
  }
}

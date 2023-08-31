//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event listener for connection timeout
mongoose.connection.on('timeout', () => {
  console.log('MongoDB connection timeout. Check if the MongoDB server is running.');
  process.exit(1); // Exit the application on timeout
});

// Event listener for successful connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Event listener for connection error
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

//TODO

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    createdAt: Date
  });
  
  // Create a Mongoose Model based on the "articles" collection and the schema
const Article = mongoose.model("Article", articleSchema);

app.get("/articles", async function (req, res) {
    try {
      // Use the Article model to find all articles in the collection
      const foundArticles = await Article.find({});
      // Render the "articles" view and pass the foundArticles as a variable
      res.render("articles", { articles: foundArticles });
    } catch (err) {
      console.log(err);
      res.status(500).send("Error retrieving articles");
    }
  });

// app.get("/articles", async function (req, res) {
//     try {
//       // Use the Article model to find all articles in the collection
//       const foundArticles = await Article.find({});
//       // Send the foundArticles as a JSON response
//       res.json(foundArticles);
//     } catch (err) {
//       console.log(err);
//       res.status(500).send("Error retrieving articles");
//     }
//   });
  
// GET route to render the "compose" form
app.get("/compose", function (req, res) {
  res.render("compose");
});

// POST route to handle form submission and store new article into MongoDB
app.post("/compose", async function (req, res) {
  const { title, content, author } = req.body;

  // Create a new Article document using the Article model
  const newArticle = new Article({
    title: title,
    content: content,
    author: author,
    createdAt: new Date()
  });

  try {
    // Save the new article to the "articles" collection in MongoDB using async/await
    await newArticle.save();
    res.redirect("/articles"); // Redirect to the list of articles after successful submission
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving the article");
  }
});

 

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
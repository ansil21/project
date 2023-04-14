const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Shipwreck = require("./models/shipwreck");
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;



// Connect to MongoDB

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const shipwreckRoutes = require("./routes/api/shipwreckRoutes");
app.use("/api/data", shipwreckRoutes);

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
  res.render('search-form');
});

app.post('/search', async (req, res) => {
  const page = parseInt(req.body.page);
  const perPage = parseInt(req.body.perPage);
  const depth = parseInt(req.body.depth);

  const skipp = (page - 1) * perPage;
  const query = {};
  if (depth) {
    query.depth = depth;
  }
  // const query = depth ? { depth: depth } : {};
  console.log(query);
  
  //const totalShipwrecks = await Shipwreck.countDocuments(query).exec();
  const data = await Shipwreck.find(query).skip(skipp).limit(perPage).exec();

  res.render('results', { data, page, perPage, depth });
});

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})
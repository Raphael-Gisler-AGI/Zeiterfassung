const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const crypto = require("crypto");
const fileName = "./data/data.json";
const categoriesPath = "./data/categories.json";
const file = require(fileName);
const categories = require(categoriesPath);

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.use(express.json());

app.post("/createEntry", (req, res) => {
  const entry = req.body;
  entry["id"] = crypto.randomBytes(16).toString("hex");
  file.Entries.push(entry);
  categories[entry.Category].Time += entry.Duration;
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.json(response());
});

app.patch("/editEntry/:id", (req, res) => {
  const { id } = req.params;
  const entry = req.body;
  entry.id = id;
  const oldEntry = file.Entries.find((e) => e.id == id);
  const category = categories.find((category) => category.id == entry.Category);
  category.Time += entry.Duration;
  if (entry.Category == oldEntry.Category) {
    category.Time -= oldEntry.Duration;
  } else {
    categories.find((category) => category.id == oldEntry.Category).Time -=
      oldEntry.Duration;
  }
  const index = file.Entries.map((entry) => entry.id).indexOf(id);
  file.Entries[index] = entry;
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.json(response());
});

app.delete("/deleteEntry/:id", (req, res) => {
  const { id } = req.params;
  const entry = file.Entries.find((entry) => entry.id == id);
  categories.find((category) => category.id == entry.Category).Time -=
    entry.Duration;
  findDelete(id);
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.json(response());
});

function findDelete(id) {
  const index = file.Entries.map((entry) => entry.id).indexOf(id);
  file.Entries.splice(index, 1);
}
function response() {
  return {
    entries: file.Entries,
    categories: categories,
  };
}

// Favorite
app.post("/createFavorite", (req, res) => {
  const favorite = req.body;
  favorite["id"] = crypto.randomBytes(16).toString("hex");
  file.Favorites.push(favorite);
  saveEntry();
  res.json(file.Favorites);
});
app.patch("/editFavorite/:id", (req, res) => {
  const { id } = req.params;
  const favorite = req.body;
  favorite.id = id;
  const index = file.Favorites.map((favorite) => favorite.id).indexOf(id);
  file.Favorites[index] = favorite;
  saveEntry();
  res.json(file.Favorites);
});
app.delete("/deleteFavorite/:id", (req, res) => {
  const { id } = req.params;
  const index = file.Favorites.map((favorite) => favorite.id).indexOf(id);
  file.Favorites.splice(index, 1);
  if (index < 0) {
    res.sendStatus(400);
    return;
  }
  saveEntry();
  res.json(file.Favorites);
});

function saveEntry() {
  return save(fileName, file);
}
function saveCategories() {
  return save(categoriesPath, categories);
}
function save(path, file) {
  fs.writeFile(path, JSON.stringify(file), (err) => {
    if (err) {
      return 400;
    }
  });
  return 200;
}

app.get("/getFavorites", (req, res) => {
  res.send(file.Favorites);
});

app.get("/getEntries", (req, res) => {
  res.send(file.Entries);
});

app.get("/getCategories", (req, res) => {
  res.send(categories);
});

const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const crypto = require("crypto");
const fileName = "./data/data.json";
const file = require(fileName);

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
  file.Categories[entry.Category].Time += entry.Duration;
  if (save() == 400) {
    res.statusMessage = "Failed to create a new entry";
    res.sendStatus(400);
    return;
  }
  res.statusMessage = "Created a new Entry";
  res.json(response());
});

app.patch("/updateEntry/:id", (req, res) => {
  const { id } = req.params;
  const entry = req.body;
  entry.id = id;
  const oldEntry = file.Entries.find((e) => e.id == id);
  const category = file.Categories.find((category) => category.id == entry.Category);
  category.Time += entry.Duration;
  if (entry.Category == oldEntry.Category) {
    category.Time -= oldEntry.Duration;
  } else {
    file.Categories.find((category) => category.id == oldEntry.Category).Time -=
      oldEntry.Duration;
  }
  const index = file.Entries.map((entry) => entry.id).indexOf(id);
  file.Entries[index] = entry;
  if (save() == 400) {
    res.statusMessage = "Failed to update your Entry";
    res.sendStatus(400);
    return;
  }
  res.statusMessage = "Updated your Entry";
  res.json(response());
});

app.delete("/deleteEntry/:id", (req, res) => {
  const { id } = req.params;
  const entry = file.Entries.find((entry) => entry.id == id);
  file.Categories.find((category) => category.id == entry.Category).Time -=
    entry.Duration;
  const index = file.Entries.map((entry) => entry.id).indexOf(id);
  file.Entries.splice(index, 1);
  if (save() == 400) {
    res.statusMessage = "Failed to delete your entry";
    res.sendStatus(400);
    return;
  }
  res.statusMessage = "Deleted your entry";
  res.json(response());
});

/**
 * Returns the updated entries and categories
 * @returns {{entries: Array, categories: Array}}
 */
function response() {
  return {
    entries: file.Entries,
    categories: file.Categories,
  };
}

// Favorite
app.post("/createFavorite", (req, res) => {
  const favorite = req.body;
  favorite["id"] = crypto.randomBytes(16).toString("hex");
  file.Favorites.push(favorite);
  res.status = save();
  res.statusMessage = "Created a new Favorite";
  res.json(file.Favorites);
});

app.patch("/updateFavorite/:id", (req, res) => {
  const { id } = req.params;
  const favorite = req.body;
  favorite.id = id;
  const index = file.Favorites.map((favorite) => favorite.id).indexOf(id);
  file.Favorites[index] = favorite;
  res.status = save();
  res.statusMessage = "Updated your Favorite";
  res.json(file.Favorites);
});

app.delete("/deleteFavorite/:id", (req, res) => {
  const { id } = req.params;
  const index = file.Favorites.map((favorite) => favorite.id).indexOf(id);
  file.Favorites.splice(index, 1);
  if (index < 0) {
    res.statusMessage = "Failed to delete your favorite";
    res.sendStatus(400);
    return;
  }
  res.status = save();
  res.statusMessage = "Deleted your Favorite";
  res.json(file.Favorites);
});

/**
 * Saves all changes made to the data file
 * @returns {number} Returns the response status code
 */
function save() {
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
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
  res.send(file.Categories);
});

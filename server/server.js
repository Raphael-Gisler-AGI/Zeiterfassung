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
    origin: "http://localhost:8080",
  })
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.get("/createEntry", (req, res) => {
  const entry = JSON.parse(req.query.data);
  entry["id"] = crypto.randomBytes(16).toString("hex");
  file.Entries.push(entry);
  categories[entry.Category].Time += entry.Duration;
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(200);
});

app.get("/editEntry", (req, res) => {
  const entry = JSON.parse(req.query.data);
  const oldEntry = file.Entries.find((e) => e.id == entry.id);
  const category = categories.find((category) => category.id == entry.Category);
  category.Time += entry.Duration;
  if (entry.Category == oldEntry.Category) {
    category.Time -= oldEntry.Duration;
  } else {
    categories.find((category) => category.id == oldEntry.Category).Time -=
      oldEntry.Duration;
  }
  Math.round(category.Time);
  file.Entries.push(entry);
  findDelete(entry.id);
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(200);
});

app.get("/deleteEntry", (req, res) => {
  const id = req.query.id;
  const entry = file.Entries.find((entry) => entry.id == id);
  categories.find((category) => category.id == entry.Category).Time -=
    entry.Duration;
  findDelete(id);
  if (saveEntry() == 400 || saveCategories() == 400) {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(200);
});

function findDelete(id) {
  const index = file.Entries.map((entry) => entry.id).indexOf(id);
  file.Entries.splice(index, 1);
}

app.get("/saveDefault", (req, res) => {
  const settings = JSON.parse(req.query.data);
  file.Default.Description = settings.Description;
  file.Default.Category = settings.Category;
  res.sendStatus(saveEntry());
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

app.get("/getDefault", (req, res) => {
  res.send(file.Default);
});

app.get("/getEntries", (req, res) => {
  res.send(file.Entries);
});

app.get("/getCategories", (req, res) => {
  res.send(categories);
});

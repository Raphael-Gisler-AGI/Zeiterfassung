const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const crypto = require("crypto");
const fileName = "./data/data.json";
const categoriesPath = "./data/categories.json";
const file = require(fileName);
const categoires = require(categoriesPath);

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
  file.User.Entries.push(entry);
  res.sendStatus(save());
});

app.get("/editEntry", (req, res) => {
  const entry = JSON.parse(req.query.data);
  console.log(entry);
  delete entry.create;
  console.log(entry);
  findDelete(entry.id);
  file.User.Entries.push(entry);
  res.sendStatus(save());
});

app.get("/deleteEntry", (req, res) => {
  const id = req.query.id;
  findDelete(id);
  res.sendStatus(save());
});

function findDelete(id) {
  const index = file.User.Entries.map((entry) => entry.id).indexOf(id);
  file.User.Entries.splice(index, 1);
}

app.get("/saveDefault", (req, res) => {
  const settings = JSON.parse(req.query.data);
  file.User.Default.Description = settings.Description;
  file.User.Default.Category = settings.Category;
  res.sendStatus(save());
});

function save() {
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
    if (err) return 400;
  });
  return 200;
}

app.get("/getDefault", (req, res) => {
  res.send(file.User.Default);
});

app.get("/getEntries", (req, res) => {
  res.send(file.User.Entries);
});

app.get("/getCategories", (req, res) => {
  res.send(categoires);
});

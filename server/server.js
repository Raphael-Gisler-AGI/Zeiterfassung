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
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
    if (err) res.sendStatus(400);
  });
  res.sendStatus(200);
});

app.get("/deleteEntry", (req, res) => {
  const id = req.query.id;
  const index = file.User.Entries.map((entry) => entry.id).indexOf(id);
  file.User.Entries.splice(index, 1);
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
    if (err) res.sendStatus(400);
  });
  res.sendStatus(200);
});
app.get("/getEntries", (req, res) => {
  res.send(file.User.Entries);
});

app.get("/getCategories", (req, res) => {
  res.send(categoires);
});

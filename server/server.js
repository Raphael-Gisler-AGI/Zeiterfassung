const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const fileName = "./data/data.json";
const file = require(fileName);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


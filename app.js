const express = require("express");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
const upload = multer({ dest: "./public/uploads" });
const PORT = 3001;
const client = new MongoClient("mongodb://localhost:27017");

app.post("/parse", upload.single("file"), async (req, res) => {
  client.connect();
  const db = client.db("search");
  const collection = db.collection("pages");

  const fileContents = fs.readFileSync(req.file.path, "utf-8");
  const arr = fileContents.split(",").map((a) => a.toLocaleLowerCase());
  const docs = arr.map((string) => ({ name: string }));
  try {
    const result = await collection.insertMany(docs);
  } finally {
    client.close();
  }
});

app.get("/search", async (req, res) => {
  client.connect();
  const db = client.db("search");
  const term = req.query.q;
  const termModified = `"${term}`;
  const collection = db.collection("pages");
  const found = await collection
    .find({ name: { $regex: `^${termModified}`, $options: "i" } })
    .toArray();

  res.status(200).send(found);
});
app.listen(PORT, () => {});

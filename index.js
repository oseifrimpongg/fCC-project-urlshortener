require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const isUrl = require("is-url");
const mongoose = require("mongoose");
const urlObject = require("./models/urlObject");

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("Mongo is connected"));

// Basic Configuration
const port = process.env.PORT || 5000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  try {
    const sentUrl = req.body.url;
    if (!isUrl(sentUrl)) return res.json({ error: "invalid url" });

    const existingUrl = await urlObject.findOne({ original_url: sentUrl });
    if (existingUrl)
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url,
      });

    const newUrlObject = {
      original_url: sentUrl,
      short_url: Math.floor(Math.random() * 100 + 1),
    };

    res.json(newUrlObject);

    await new urlObject(newUrlObject)
      .save()
      .then(() => console.log("New Url Received and saved"));
  } catch (err) {
    console.log("An error occured, just figure it out bro");
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    const shortUrl = req.params.short_url;
    const foundUrl = await urlObject.findOne({ short_url: shortUrl });

    res.redirect(foundUrl.original_url);
  } catch (err) {
    console.log("an error occured, it's none of your business");
    console.log(err.message);
  }
});

app.listen(port, () => console.log(`Server is running on Port ${port}`));

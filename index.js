

const express = require("express");
const app = express();
const Shorturl=require('./models/url');

const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const urlRoute = require("./routes/url");

app.use(express.json());
mongoose
  .connect("mongodb://localhost:27017/url  3")
 
  
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));


app.use("/api/auth", authRoute);
app.use('/', require('./routes/redirect'))
app.use("/api/url", urlRoute);



app.listen("8000", () => {
  console.log("Backend is running.");
});
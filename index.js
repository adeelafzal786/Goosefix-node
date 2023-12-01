const express = require("express");
const cors = require("cors");
require('dotenv').config();


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Routes
app.use("/stripe", require("./routes/stripe"));
app.use("/email", require("./routes/email"))

// Listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

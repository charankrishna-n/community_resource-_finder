const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/resources", require("./routes/resources"));

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Community Resource Finder API" }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

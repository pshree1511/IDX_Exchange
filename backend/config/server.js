require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();

        console.log(
            `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
});

app.use("/api/health", require("../routes/health"));
app.use("/api/properties", require("../routes/properties"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use((req, res, next) =>{
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] ${req.method} ${req.url}`);
//     next();
// });
// app.use('/api/health', require("../routes/health"));
// app.use('/api/properties", require("../routes/properties');

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

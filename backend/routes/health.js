const express = require("express");
const router = express.Router();
const pool = require("..config/db");

router.get("/", async (req, res) =>{
    try{
        await pool.query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected",
        });
    } catch (error){
        res.status(500).json({
            status: "error",
            database: "disconnected"
        })
    }
});

module.exports = router;

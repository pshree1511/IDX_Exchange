const express = require("express");
const router = express.Router();
const pool = require("../config/db");

function validateListing(id){
  if (!id || id.trim() === ''){
    return { valid: false, error: 'Listing Id is required.'};
  }
  if(id.length > 50){
    return { valid: false, error: 'Listing Id is too long.'};
  }

  return {valid: true};
}

router.get('/:id/openhouses', async(req, res) => {
  try{
    const {id} = req.params;
    const validate = validateListing(id);

    if(!validate.valid) {
      return res.status(400).json({
        error: validate.error
      });
    }

    const [propertyCheck] = await pool.query(
      'SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?',
      [id]
    );

    if(propertyCheck.length == 0){
      return res.status(404).json({
        error: 'Property not found.',
        message: `No property found with ID ${id}`
      });
    }

    const [openhouses] = await pool.query(
      'SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate, OpenHouseStartTime',
      [id]
    );

    res.json({
      propertyId: id,
      count: openhouses.length,
      openhouses
    });
  } catch(error){
    console.error('Database error: ', error);
    res.status(500).json({
      error: 'Error fetching properties'
    });
  }


});

router.get('/:id', async(req, res) => {
  try{
    const {id} = req.params;
    const validate = validateListing(id);

    if(!validate.valid) {
      return res.status(400).json({
        error: validate.error
      });
    }

    const [results] = await pool.query(
      'SELECT * FROM rets_property WHERE L_ListingID = ?',
      [id]
    );

    if(results.length == 0){
      return res.status(404).json({
        error: 'Property not found.',
        message: `No property found with ID ${id}`
      });
    }

    res.json(
      results[0]
    );
  } catch(error){
    console.error('Database error: ', error);
    res.status(500).json({
      error: 'Error fetching properties'
    });
  }


});

router.get("/", async (req, res) => {
  try {
    let {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit = 20,
      offset = 0
    } = req.query;

    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);

    if (isNaN(limit)) limit = 20;
    if (isNaN(offset)) offset = 0;

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ message: "Invalid limit (1-100 allowed)" });
    }

    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({ message: "Invalid offset" });
    }

    if (minPrice && isNaN(Number(minPrice))) {
      return res.status(400).json({ message: "minPrice must be a number" });
    }

    if (maxPrice && isNaN(Number(maxPrice))) {
      return res.status(400).json({ message: "maxPrice must be a number" });
    }

    if (beds && isNaN(Number(beds))) {
      return res.status(400).json({ message: "beds must be a number" });
    }

    if (baths && isNaN(Number(baths))) {
      return res.status(400).json({ message: "baths must be a number" });
    }

    let where = [];
    let values = [];

    if (city) {
      //where.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      where.push("L_City IS NOT NULL AND LOWER(L_City) LIKE LOWER(?)");
      values.push(city);
    }

    if (zipcode) {
      where.push("L_Zip = ?");
      values.push(zipcode);
    }

    if (minPrice) {
      where.push("L_SystemPrice >= ?");
      values.push(Number(minPrice));
    }

    if (maxPrice) {
      where.push("L_SystemPrice <= ?");
      values.push(Number(maxPrice));
    }

    if (beds) {
      where.push("L_Keyword2 >= ?");
      values.push(Number(beds));
    }

    if (baths) {
      where.push("LM_Dec_3 >= ?");
      values.push(Number(baths));
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM rets_property ${whereClause}`,
      values
    );

    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM rets_property
       ${whereClause}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({
      total,
      limit,
      offset,
      results: rows
    });

  } catch (err) {
    console.error("Properties error:", err.message);

    console.error("FULL ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;

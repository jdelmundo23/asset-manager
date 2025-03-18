import express from "express";
import { getPool } from "../../sql";
import { Asset, assetSchema } from "../../types/assetSchema";
import sql from "mssql";
const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM Assets`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve asset data:" + err });
  }
});

router.post("/", async function (req, res) {
  const result = assetSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.format() });
    return;
  }

  const asset: Asset = req.body;
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("name", sql.VarChar(100), asset.name)
      .input("identifier", sql.VarChar(100), asset.identifier)
      .input("locationID", sql.Int, asset.locationID)
      .input("departmentID", sql.Int, asset.departmentID)
      .input("modelID", sql.Int, asset.modelID)
      .input("assignedTo", sql.VarChar(75), asset.assignedTo)
      .input("purchaseDate", sql.Date, asset.purchaseDate)
      .input("warrantyExp", sql.Date, asset.warrantyExp)
      .input("cost", sql.Decimal(6, 2), asset.cost)
      .input("macAddress", sql.VarChar(24), asset.macAddress)
      .input("ipAddress", sql.VarChar(15), asset.ipAddress).query(`
    INSERT INTO Assets (
      name, 
      identifier, 
      locationID, 
      departmentID, 
      modelID, 
      assignedTo, 
      purchaseDate, 
      warrantyExp, 
      cost, 
      macAddress, 
      ipAddress
    )
    VALUES (
      @name, 
      @identifier, 
      @locationID, 
      @departmentID, 
      @modelID, 
      @assignedTo, 
      @purchaseDate, 
      @warrantyExp, 
      @cost, 
      @macAddress, 
      @ipAddress
    )
  `);
    res.status(200).json({ message: "Data inserted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});

router.put("/", async function (req, res) {
  const result = assetSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.format() });
    return;
  }

  const asset: Asset = req.body;

  if (!asset.ID) {
    res.status(400).json({ error: "Missing ID of asset to edit" });
    return;
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.Int, asset.ID)
      .input("name", sql.VarChar(100), asset.name)
      .input("identifier", sql.VarChar(100), asset.identifier)
      .input("locationID", sql.Int, asset.locationID)
      .input("departmentID", sql.Int, asset.departmentID)
      .input("modelID", sql.Int, asset.modelID)
      .input("assignedTo", sql.VarChar(75), asset.assignedTo)
      .input("purchaseDate", sql.Date, asset.purchaseDate)
      .input("warrantyExp", sql.Date, asset.warrantyExp)
      .input("cost", sql.Decimal(6, 2), asset.cost)
      .input("macAddress", sql.VarChar(24), asset.macAddress)
      .input("ipAddress", sql.VarChar(15), asset.ipAddress).query(`
    UPDATE Assets
    SET 
      name = @name,
      identifier = @identifier,
      locationID = @locationID,
      departmentID = @departmentID,
      modelID = @modelID,
      assignedTo = @assignedTo,
      purchaseDate = @purchaseDate,
      warrantyExp = @warrantyExp,
      cost = @cost,
      macAddress = @macAddress,
      ipAddress = @ipAddress
    WHERE ID = @ID
  `);

    res.status(200).json({ message: "Data edited successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit data" });
  }
});

router.delete("/:assetID", async function (req, res) {
  const { assetID } = req.params;

  if (!assetID) {
    res.status(400).json({ error: "Asset ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    const query = `DELETE FROM Assets WHERE ID = @ID`;
    await pool.request().input("ID", sql.Int, assetID).query(query);
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;

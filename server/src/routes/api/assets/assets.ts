import express from "express";
import { getPool } from "../../../sql";
import { Asset, assetSchema } from "@shared/schemas";
import sql from "mssql";
import { z } from "zod";

const inputs = (asset: Asset) => [
  { name: "ID", type: sql.Int, value: asset.ID },
  { name: "name", type: sql.VarChar(100), value: asset.name },
  { name: "identifier", type: sql.VarChar(100), value: asset.identifier },
  { name: "locationID", type: sql.Int, value: asset.locationID },
  { name: "departmentID", type: sql.Int, value: asset.departmentID },
  { name: "modelID", type: sql.Int, value: asset.modelID },
  { name: "assignedTo", type: sql.VarChar(75), value: asset.assignedTo },
  { name: "purchaseDate", type: sql.DateTime, value: asset.purchaseDate },
  { name: "warrantyExp", type: sql.DateTime, value: asset.warrantyExp },
  { name: "cost", type: sql.Decimal(6, 2), value: asset.cost },
];

const appendInputs = (
  request: sql.Request,
  asset: Asset,
  exclusions: string[] = []
) => {
  for (const input of inputs(asset)) {
    if (!exclusions.includes(input.name)) {
      request.input(input.name, input.type, input.value);
    }
  }
  return request;
};

const router = express.Router();

router.get("/all", async function (req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT Assets.ID,
      Assets.name,
      Assets.identifier,
      Assets.locationID,
      Assets.departmentID,
      Assets.modelID,
      AssetModels.typeID,
      Assets.assignedTo,
      Assets.purchaseDate,
      Assets.warrantyExp,
      Assets.cost,
      Assets.note FROM Assets JOIN AssetModels ON Assets.modelID = AssetModels.ID`
    );

    const parse = z.array(assetSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
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
  const asset: Asset = result.data;

  try {
    const pool = await getPool();
    const request = pool.request();

    const appendedRequest = appendInputs(request, asset);
    await appendedRequest.query(`
    INSERT INTO Assets (
      name, 
      identifier, 
      locationID, 
      departmentID, 
      modelID, 
      assignedTo, 
      purchaseDate, 
      warrantyExp, 
      cost
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
      @cost
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
  const asset: Asset = result.data;

  if (!asset.ID) {
    res.status(400).json({ error: "Missing ID of asset to edit" });
    return;
  }

  try {
    const pool = await getPool();
    const request = pool.request();

    const appendedRequest = appendInputs(request, asset);
    await appendedRequest.query(`
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
      cost = @cost
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

router.post("/duplicate", async function (req, res) {
  const result = assetSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.format() });
    return;
  }
  const asset: Asset = result.data;

  if (!asset.ID) {
    res.status(400).json({ error: "Missing ID of asset to duplicate" });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("ID", sql.Int, asset.ID)
      .query(`SELECT * FROM Assets WHERE ID = @ID`);

    if (result.recordset.length === 0) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const originalAsset = result.recordset[0];

    const request = pool.request();
    const appendedRequest = appendInputs(request, originalAsset, [
      "name",
      "identifier",
    ]);

    await appendedRequest
      .input("name", sql.VarChar(100), `${originalAsset.name} - Copy`)
      .input("identifier", sql.VarChar(100), null).query(`
      INSERT INTO Assets (name, identifier, locationID, departmentID, modelID, assignedTo, purchaseDate, warrantyExp, cost)
      VALUES (@name, @identifier, @locationID, @departmentID, @modelID, @assignedTo, @purchaseDate, @warrantyExp, @cost)
    `);

    res.status(200).json({ message: "Asset duplicated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to duplicate asset" });
  }
});

export default router;

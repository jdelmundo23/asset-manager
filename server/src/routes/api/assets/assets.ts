import express from "express";
import { getPool } from "@server/src/sql";
import { Asset, AssetRow, assetRowSchema, assetSchema } from "@shared/schemas";
import sql from "mssql";
import { z } from "zod";
import { parseInputReq } from "@server/src/utils";

const inputDefinitions = [
  { name: "ID", type: sql.Int },
  { name: "name", type: sql.VarChar(100) },
  { name: "identifier", type: sql.VarChar(100) },
  { name: "locationID", type: sql.Int },
  { name: "departmentID", type: sql.Int },
  { name: "modelID", type: sql.Int },
  { name: "assignedTo", type: sql.VarChar(75) },
  { name: "purchaseDate", type: sql.DateTime },
  { name: "warrantyExp", type: sql.DateTime },
  { name: "cost", type: sql.Decimal(6, 2) },
  { name: "note", type: sql.NVarChar(255) },
  { name: "rowVersion", type: sql.Binary() },
] as const;

const inputs = (asset: Partial<Asset> | Partial<AssetRow> = {}) =>
  inputDefinitions.map((def) => ({
    ...def,
    value:
      def.name === "rowVersion" && asset.rowVersion
        ? Buffer.from(asset.rowVersion, "base64")
        : asset[def.name],
  }));

const appendInputs = (
  request: sql.Request,
  asset: Asset | AssetRow,
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
      Assets.rowVersion,
      Assets.createdTime,
      Assets.updatedTime,
      Assets.note FROM Assets LEFT JOIN AssetModels ON Assets.modelID = AssetModels.ID`
    );

    const parse = z.array(assetRowSchema).safeParse(result.recordset);

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
  const asset = parseInputReq(assetSchema, req.body);
  if (!asset) {
    res.status(400).json({ error: "Invalid asset" });
    return;
  }

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), asset, [
      "ID",
      "rowVersion",
    ]);
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
    if (err instanceof sql.RequestError && err.message.includes("identifier")) {
      res
        .status(500)
        .json({ error: "Identifier already exists for the asset model" });
    } else {
      res.status(500).json({ error: "Failed to add data" });
    }
  }
});

router.put("/", async function (req, res) {
  const asset = parseInputReq(assetRowSchema, req.body);
  if (!asset) {
    res.status(400).json({ error: "Invalid asset row" });
    return;
  }

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), asset);
    const result = await appendedRequest.query(`
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
    WHERE ID = @ID AND rowVersion = @rowVersion
  `);

    if (result.rowsAffected[0] === 0) {
      res
        .status(409)
        .json({ error: "Row no longer exists or modified by another user" });
      return;
    }

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
  const asset: Asset = req.body;

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

    const appendedRequest = appendInputs(pool.request(), originalAsset, [
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

router.patch("/", async function (req, res) {
  const rowVersion = req.body.rowVersion;
  const assetID = req.body.ID;
  if (!assetID || !rowVersion) {
    res.status(400).json({ error: "Asset ID or row version missing" });
    return;
  }

  const column = parseInputReq(assetRowSchema.keyof(), req.body.column);
  if (!column) {
    res.status(400).json({ error: "Invalid column" });
    return;
  }

  const value = parseInputReq(assetRowSchema.shape[column], req.body.value);
  if (value === undefined) {
    res.status(400).json({ error: "Invalid value format" });
    return;
  }

  try {
    const pool = await getPool();

    const sqlType = inputDefinitions.find((def) => def.name === column)?.type;

    if (!sqlType) {
      res.status(400).json({ error: "Invalid column" });
      return;
    }

    const result = await pool
      .request()
      .input(column, sqlType, value)
      .input("rowVersion", sql.Binary(), Buffer.from(rowVersion, "base64"))
      .input("ID", sql.Int, assetID).query(`
        UPDATE Assets 
        SET ${column} = @${column} 
        WHERE ID = @ID AND rowVersion = @rowVersion`);

    if (result.rowsAffected[0] === 0) {
      res
        .status(409)
        .json({ error: "Row no longer exists or modified by another user" });
      return;
    }

    res.status(200).json({ message: "Asset edited successfully!" });
  } catch (error) {
    console.log(error);
    if (error instanceof sql.RequestError) {
      if (error.message.includes("warranty")) {
        res
          .status(500)
          .json({ error: "Warranty expiration must be after purchase date." });
        return;
      } else if (error.message.includes("identifier")) {
        res.status(500).json({
          error: "Identifier already exists for model.",
        });
        return;
      }
    }
    res.status(500).json({ error: "Failed to edit asset" });
  }
});

export default router;

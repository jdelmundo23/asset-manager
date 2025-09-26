import express, { RequestHandler } from "express";
import { getPool } from "@server/src/sql";
import { Asset, assetSchema } from "@shared/schemas";
import sql from "mssql";
import { z, ZodObject, ZodRawShape } from "zod";

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
] as const;

const inputs = (asset: Partial<Asset> = {}) =>
  inputDefinitions.map((def) => ({
    ...def,
    value: asset[def.name as keyof Asset],
  }));

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

const validateAssetInput: RequestHandler = async (req, res, next) => {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return next();
  }

  let result;

  if (req.method === "PATCH") {
    const shape = assetSchema.innerType() as ZodObject<ZodRawShape>;
    const column = req.body.column;
    const value = req.body.value;

    const validColumns: string[] = shape.keyof().options as string[];
    if (!validColumns.includes(column)) {
      res.status(400).json({ error: "Invalid column" });
      return;
    }

    const columnSchema = shape.pick({ [column]: true });
    result = columnSchema.safeParse({ [column]: value });
    if (!result.success) {
      res.status(400).json({ error: result.error.format() });
      return;
    }

    req.body = { ...result.data, column: column, ID: req.body.ID };
  } else {
    result = assetSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.format() });
      return;
    }

    req.body = result.data;
  }

  next();
};

const router = express.Router();

router.use(validateAssetInput);

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
      Assets.note FROM Assets LEFT JOIN AssetModels ON Assets.modelID = AssetModels.ID`
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
  const asset: Asset = req.body;

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), asset);
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
  const asset: Asset = req.body;

  if (!asset.ID) {
    res.status(400).json({ error: "Asset ID is required" });
    return;
  }

  try {
    const pool = await getPool();

    const appendedRequest = appendInputs(pool.request(), asset);
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
  const assetID = req.body.ID;
  const columnName = req.body.column;
  const newValue = req.body[columnName];

  if (!assetID) {
    res.status(400).json({ error: "Asset ID is required" });
    return;
  }

  try {
    const pool = await getPool();

    const sqlType = inputDefinitions.find(
      (def) => def.name === columnName
    )?.type;

    if (!sqlType) {
      res.status(400).json({ error: "Type not found due to invalid column" });
      return;
    }

    await pool
      .request()
      .input(columnName, sqlType, newValue)
      .input("ID", sql.Int, assetID).query(`
        UPDATE Assets 
        SET ${columnName} = @${columnName} 
        WHERE ID = @ID`);

    res.status(200).json({ message: "Cell edited successfully!" });
  } catch (error) {
    console.log(error);
    if (
      error instanceof sql.RequestError &&
      error.message.includes("warranty")
    ) {
      res
        .status(500)
        .json({ error: "Warranty expiration must be after purchase date." });
    } else {
      res.status(500).json({ error: "Failed to edit cell" });
    }
  }
});

export default router;

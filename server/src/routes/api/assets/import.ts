import { assetImportSchema } from "@shared/schemas";
import express from "express";
import { getPool } from "@server/src/sql";
import { detectMissingRows, parseInputReq } from "@server/src/utils";
import z from "zod";

const router = express.Router();

router.post("/check", async function (req, res) {
  const assets = parseInputReq(z.array(assetImportSchema), req.body);

  if (!assets) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const pool = await getPool();

    const modelsMap = await detectMissingRows(
      pool,
      "assetmodels",
      "name",
      (asset) => asset.Model,
      assets
    );
    const locationsMap = await detectMissingRows(
      pool,
      "locations",
      "name",
      (asset) => asset.Location,
      assets
    );
    const departmentsMap = await detectMissingRows(
      pool,
      "departments",
      "name",
      (asset) => asset.Department,
      assets
    );

    res.json({
      modelAndTypes: Array.from(modelsMap),
      locations: Array.from(locationsMap),
      departments: Array.from(departmentsMap),
    });
  } catch (err) {
    console.log(err);
  }
});

export default router;

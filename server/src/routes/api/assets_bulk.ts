import express from "express";
import { getPool } from "../../sql";
import sql from "mssql";
const router = express.Router();

router.post("/delete", async function (req, res) {
  const { ids } = req.body;

  if (ids.length === 0) {
    res.status(400).json({ error: "No IDs provided" });
    return;
  }
  try {
    const pool = await getPool();

    const request = pool.request();
    const placeholders: string = ids
      .map((_: string, i: number) => `@id${i}`)
      .join(", ");

    ids.forEach((id: string, i: number) => {
      request.input(`id${i}`, sql.Int, id);
    });
    const query = `
      DELETE FROM Assets
      WHERE ID IN (${placeholders})
    `;
    await request.query(query);

    res.json({ message: "Assets deleted successfully", deleted: ids.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete assets" });
  }
});

router.post("/duplicate", async function (req, res) {
  const { ids } = req.body;

  if (ids.length === 0) {
    res.status(400).json({ error: "No IDs provided" });
    return;
  }

  try {
    const pool = await getPool();

    const selectRequest = pool.request();
    const placeholders: string = ids
      .map((_: string, i: number) => `@id${i}`)
      .join(", ");

    ids.forEach((id: string, i: number) => {
      selectRequest.input(`id${i}`, sql.Int, id);
    });

    const selectQuery = `
    SELECT name, identifier, locationID, departmentID, modelID,
           assignedTo, purchaseDate, warrantyExp, cost, note
    FROM Assets
    WHERE ID IN (${placeholders})
  `;
    const result = await selectRequest.query(selectQuery);
    const rows = result.recordset;

    const insertRequest = pool.request();

    rows.forEach((row, index) => {
      insertRequest.input(`name${index}`, sql.VarChar, `${row.name} - Copy`);
      insertRequest.input(`identifier${index}`, sql.VarChar, null);
      insertRequest.input(`locationID${index}`, sql.Int, row.locationID);
      insertRequest.input(`departmentID${index}`, sql.Int, row.departmentID);
      insertRequest.input(`modelID${index}`, sql.Int, row.modelID);
      insertRequest.input(`assignedTo${index}`, sql.VarChar, row.assignedTo);
      insertRequest.input(
        `purchaseDate${index}`,
        sql.DateTime,
        row.purchaseDate
      );
      insertRequest.input(`warrantyExp${index}`, sql.DateTime, row.warrantyExp);
      insertRequest.input(`cost${index}`, sql.Decimal(6, 2), row.cost);
      insertRequest.input(`note${index}`, sql.NVarChar, row.note);
    });

    const valuesClause = rows
      .map(
        (_, i) =>
          `(@name${i}, @identifier${i}, @locationID${i}, @departmentID${i}, @modelID${i}, @assignedTo${i}, @purchaseDate${i}, @warrantyExp${i}, @cost${i}, @note${i})`
      )
      .join(", ");

    const insertQuery = `
      INSERT INTO Assets (
        name, identifier, locationID, departmentID, modelID,
        assignedTo, purchaseDate, warrantyExp, cost, note
      )
      VALUES ${valuesClause}
    `;

    await insertRequest.query(insertQuery);

    res.json({
      message: "Assets duplicated successfully",
      deleted: ids.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to duplicate assets" });
  }
});

export default router;

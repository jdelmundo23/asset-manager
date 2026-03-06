import express, { RequestHandler } from "express";
import { getPool } from "@server/src/sql";
import sql from "mssql";

const appendPlaceholderInputs = (request: sql.Request, ids: number[]) => {
  const placeholders: string = ids
    .map((_: number, i: number) => `@id${i}`)
    .join(", ");

  ids.forEach((id: number, i: number) => {
    request.input(`id${i}`, sql.Int, id);
  });

  return { request, placeholders };
};

const checkIds: RequestHandler = async (req, res, next) => {
  const { ids } = req.body;

  if (ids.length < 1 || !ids) {
    res.status(400).json({ error: "No IDs provided" });
    return;
  }

  next();
};

const router = express.Router();

router.use(checkIds);

router.post("/delete", async function (req, res) {
  const { ids } = req.body;

  try {
    const pool = await getPool();

    const { request, placeholders } = appendPlaceholderInputs(
      pool.request(),
      ids
    );

    await request.query(`
      DELETE FROM Assets
      WHERE ID IN (${placeholders})
    `);

    res.json({ message: "Assets deleted successfully", deleted: ids.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete assets" });
  }
});

router.post("/duplicate", async function (req, res) {
  const { ids } = req.body;

  try {
    const pool = await getPool();

    const { request, placeholders } = appendPlaceholderInputs(
      pool.request(),
      ids
    );

    await request.query(`
      INSERT INTO Assets (
        name, identifier, locationID, departmentID, modelID,
        assignedTo, purchaseDate, warrantyExp, cost, note
      )
      SELECT 
        name + ' - Copy',
        NULL,
        locationID,
        departmentID,
        modelID,
        assignedTo,
        purchaseDate,
        warrantyExp,
        cost,
        note
      FROM Assets
      WHERE ID IN (${placeholders})
    `);

    res.json({
      message: "Assets duplicated successfully",
      duplicated: ids.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to duplicate assets" });
  }
});

router.patch("/edit", async function (req, res) {
  const { ids, template, fieldsToUpdate } = req.body;
  console.log(req.body);

  try {
    const pool = await getPool();

    const { request, placeholders } = appendPlaceholderInputs(
      pool.request(),
      ids
    );

    const fieldConfig = {
      modelID: sql.Int,
      locationID: sql.Int,
      departmentID: sql.Int,
      assignedTo: sql.UniqueIdentifier,
      purchaseDate: sql.DateTime,
      warrantyExp: sql.DateTime,
      cost: sql.Decimal(6, 2),
      note: sql.NVarChar,
    };

    const updates = Object.entries(fieldConfig)
      .filter(([field]) => fieldsToUpdate[field])
      .map(([field, type]) => {
        request.input(field, type, template[field]);
        return `${field} = @${field}`;
      });

    if (!updates.length) {
      res.status(400).json({ error: "No fields selected for update" });
      return;
    }

    await request.query(`
      UPDATE Assets
      SET ${updates.join(", ")}
      WHERE ID IN (${placeholders})
    `);

    res.json({
      message: "Assets updated successfully",
      updated: ids.length,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof sql.RequestError && err.message.includes("warranty")) {
      res.status(500).json({
        error:
          "One or more selected assets will have conflicting purchase/warranty dates",
      });
      return;
    }
    res.status(500).json({ error: "Failed to update assets" });
  }
});

export default router;

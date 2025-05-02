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

export default router;

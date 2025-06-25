import express from "express";
import { getPool } from "../../../sql";
import sql from "mssql";
import { IPInsert, ipInputSchema, ipRowSchema } from "@shared/schemas";
import { z } from "zod";
import {
  addSubnet,
  parseInputReq,
  recordExists,
  splitIpAddress,
  validateSingleField,
} from "../../../utils";

type InputField = {
  name: string;
  type: sql.ISqlType | (() => sql.ISqlType);
};

const inputDefinitions: InputField[] = [
  { name: "ID", type: sql.Int },
  { name: "hostNumber", type: sql.TinyInt },
  { name: "subnetID", type: sql.Int },
  { name: "name", type: sql.VarChar(100) },
  { name: "macAddress", type: sql.VarChar(24) },
  { name: "assetID", type: sql.Int },
];

const inputs = (ip: Partial<IPInsert> = {}) =>
  inputDefinitions.map((def) => ({
    ...def,
    value: ip[def.name as keyof IPInsert],
  }));

const appendInputs = (
  request: sql.Request,
  ip: IPInsert,
  exclusions: string[] = []
) => {
  for (const input of inputs(ip)) {
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
      `SELECT 
        IpAddresses.*, 
        Assets.name AS assetName,
        Subnets.subnetPrefix
      FROM IpAddresses
      LEFT JOIN Assets ON IpAddresses.assetID = Assets.ID
      LEFT JOIN Subnets ON IpAddresses.subnetID = Subnets.ID;`
    );

    const parse = z.array(ipRowSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve ip data:" + err });
  }
});

router.get("/by-asset/:assetID", async function (req, res) {
  const { assetID } = req.params;
  if (!assetID) {
    res.status(400).json({ error: "Asset ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("assetID", sql.Int, assetID)
      .query(`SELECT * FROM IpAddresses WHERE assetID = @assetID`);

    if (result.recordset.length < 1) {
      res.json([]);
      return;
    }

    const parse = z.array(ipRowSchema).safeParse(result.recordset);

    if (parse.error) {
      console.error(parse.error);
      res.status(500).json({ error: "Failed to parse database records" });
      return;
    }

    res.json(parse.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve ip data:" + err });
  }
});

router.post("/", async function (req, res) {
  const ip = parseInputReq(ipInputSchema, req.body);
  if (!ip) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { subnetPrefix, hostNumber } = splitIpAddress(ip.ipAddress);

  try {
    const pool = await getPool();

    let subnetID;
    try {
      ({ subnetID } = await addSubnet(pool, subnetPrefix));
    } catch {
      res.status(500).json({ error: "Failed to get or add subnet" });
      return;
    }

    const check = await recordExists(pool, "IPAddresses", {
      subnetID: subnetID,
      hostNumber: hostNumber,
    });
    if (check.error) {
      res.status(500).json({ error: "Failed to check if IP exists" });
      return;
    }
    if (check.exists) {
      res.status(400).json({ error: "IP Address already exists" });
      return;
    }

    const ipInsert: IPInsert = {
      ...ip,
      subnetID,
      hostNumber,
    };

    const appendedRequest = appendInputs(pool.request(), ipInsert);
    await appendedRequest.query(`
        INSERT INTO IPAddresses (
          hostNumber,
          subnetID,
          name,
          macAddress,
          assetID
        )
        VALUES (
          @hostNumber,
          @subnetID,
          @name,
          @macAddress,
          @assetID
        )
      `);

    res.status(200).json({ message: "Data inserted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add data" });
  }
});

router.put("/", async function (req, res) {
  const ip = parseInputReq(ipInputSchema, req.body);
  if (!ip || !ip.ID) {
    res
      .status(400)
      .json({ error: `Invalid request body${!ip?.ID && ": Missing ID"}` });
    return;
  }

  const { subnetPrefix, hostNumber } = splitIpAddress(ip.ipAddress);

  try {
    const pool = await getPool();

    let subnetID;
    try {
      ({ subnetID } = await addSubnet(pool, subnetPrefix));
    } catch {
      res.status(500).json({ error: "Failed to get or add subnet" });
      return;
    }

    const existing = await pool
      .request()
      .input("ID", ip.ID)
      .query(`SELECT subnetID, hostNumber FROM IPAddresses WHERE ID = @ID`);

    if (!existing.recordset.length) {
      res.status(404).json({ error: "IP record not found" });
      return;
    }

    const current = existing.recordset[0];

    if (current.subnetID !== subnetID || current.hostNumber !== hostNumber) {
      const check = await recordExists(pool, "IPAddresses", {
        subnetID: subnetID,
        hostNumber: hostNumber,
      });

      if (check.error) {
        res.status(500).json({ error: "Failed to check if IP exists" });
        return;
      }
      if (check.exists) {
        res.status(400).json({ error: "IP Address already exists" });
        return;
      }
    }

    const ipInsert: IPInsert = {
      ...ip,
      subnetID,
      hostNumber,
    };

    const appendedRequest = appendInputs(pool.request(), ipInsert);
    await appendedRequest.query(`
    UPDATE IPAddresses
    SET
      hostNumber = @hostNumber,
      subnetID = @subnetID,
      name = @name,
      macAddress = @macAddress,
      assetID = @assetID
    WHERE ID = @ID
    `);

    res.status(200).json({ message: "Data updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

router.delete("/:ipID", async function (req, res) {
  const { ipID } = req.params;

  if (!ipID) {
    res.status(400).json({ error: "IP Address ID is required" });
    return;
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.Int, ipID)
      .query(`DELETE FROM IPAddresses WHERE ID = @ID`);
    res.status(200).json({ message: "IP deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete IP" });
  }
});

router.patch("/", async function (req, res) {
  const ipID = req.body.ID;
  const columnName = req.body.column;
  const newValue = req.body.value;

  const valueCheck = validateSingleField(ipInputSchema, columnName, newValue);
  if (!valueCheck?.success) {
    res.status(400).json({ error: "Value failed input validation" });
    return;
  }

  if (!ipID) {
    res.status(400).json({ error: "IP Address ID is required" });
    return;
  }

  try {
    const pool = await getPool();

    const sqlReq = pool.request().input("ID", sql.Int, ipID);

    if (columnName === "ipAddress") {
      const { subnetPrefix, hostNumber } = splitIpAddress(newValue);

      let subnetID;
      try {
        ({ subnetID } = await addSubnet(pool, subnetPrefix));
      } catch {
        res.status(500).json({ error: "Failed to get or add subnet" });
        return;
      }

      const check = await recordExists(pool, "IPAddresses", {
        subnetID: subnetID,
        hostNumber: hostNumber,
      });
      if (check.error) {
        res.status(500).json({ error: "Failed to check if IP exists" });
        return;
      }
      if (check.exists) {
        res.status(400).json({ error: "IP Address already exists" });
        return;
      }

      await sqlReq
        .input("subnetID", sql.Int, subnetID)
        .input("hostNumber", sql.TinyInt, hostNumber).query(`UPDATE IPAddresses
          SET 
          hostNumber = @hostNumber, 
          subnetID = @subnetID
          WHERE ID = @ID`);
    } else {
      const inputField = inputDefinitions.find(
        (def) => def.name === columnName
      );

      if (!inputField) {
        res
          .status(400)
          .json({ error: "Field type not found due to invalid column" });
        return;
      }
      await sqlReq.input(columnName, inputField.type, newValue).query(`
        UPDATE IPAddresses
          
          SET ${columnName} = @${columnName} 
          WHERE ID = @ID`);
    }
    res.status(200).json({ message: "Cell edited successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to edit cell" });
  }
});

export default router;

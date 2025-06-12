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
} from "../../../utils";

const inputs = (ip: IPInsert) => [
  { name: "ID", type: sql.Int, value: ip.ID },
  { name: "hostNumber", type: sql.TinyInt, value: ip.hostNumber },
  { name: "subnetID", type: sql.Int, value: ip.subnetID },
  { name: "name", type: sql.VarChar(100), value: ip.name },
  { name: "macAddress", type: sql.VarChar(24), value: ip.macAddress },
  { name: "assetID", type: sql.Int, value: ip.assetID },
];

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
//   if (req.method !== "POST" && req.method !== "PUT") {
//     return next();
//   }

//   const parse = ipInputSchema.safeParse(req.body);

//   if (!parse.success) {
//     res.status(400).json({ error: parse.error.format() });
//     return;
//   }

//   const ip = parse.data;

//   try {
//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input("ipAddress", sql.VarChar(15), ip.ipAddress).query(`
//       SELECT ID from ipAddresses WHERE ipAddress = @ipAddress;
// `);

//     if (result.recordset[0]?.ID && result.recordset[0]?.ID !== ip.ID) {
//       res.status(400).json({ error: "IP already exists" });
//       return;
//     }
//     req.body = parse.data;

//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to check if IP exists" });
//   }
// };

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

// router.put("/", async function (req, res) {
//   const ip = req.body;

//   if (!ip.ID) {
//     res.status(400).json({ error: "Missing ID of IP to edit" });
//     return;
//   }

//   try {
//     const pool = await getPool();

//     const appendedRequest = appendInputs(pool.request(), ip);
//     await appendedRequest.query(`
//     UPDATE IpAddresses
//     SET
//       ipAddress = @ipAddress,
//       name = @name,
//       macAddress = @macAddress,
//       assetID = @assetID
//     WHERE ID = @ID
//   `);

//     res.status(200).json({ message: "Data edited successfully!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to edit data" });
//   }
// });

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

export default router;

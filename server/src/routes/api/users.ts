import express from "express";
import axios from "axios";
import { GRAPH_ENDPOINT } from "../../authConfig";
import { User } from "@microsoft/microsoft-graph-types";
const router = express.Router();

const group_id = process.env.ENTRA_USER_GROUP_ID;

router.get("/all", async function (req, res) {
  const options = {
    headers: {
      Authorization: `Bearer ${req.session.accessToken}`,
    },
  };

  try {
    const response = await axios.get(
      `${GRAPH_ENDPOINT}groups/${group_id}/members`,
      options
    );
    const data = await response.data;
    res.json(
      data.value.map((user: User) => ({
        ID: user.id,
        name: user.displayName,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve user data" });
  }
});

export default router;

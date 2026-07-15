import { NextApiRequest, NextApiResponse } from "next";
import { getTransports } from "./index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ error: "Missing sessionId" });
    return;
  }

  const transport = getTransports().get(sessionId);
  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  try {
    await transport.handlePostMessage(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Error" });
  }
}

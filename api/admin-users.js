import { getDb } from "../lib/mongodb.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload || !payload.admin) return res.status(401).json({ error: "Admin access required" });

  try {
    const db = await getDb();
    const users = await db.collection("users")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const deposits = await db.collection("deposits")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return res.status(200).json({ users, deposits });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Invalid or expired session" });

    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        portfolio: user.portfolio,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

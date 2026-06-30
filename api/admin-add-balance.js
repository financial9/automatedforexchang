import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload || !payload.admin) return res.status(401).json({ error: "Admin access required" });

  try {
    const { userId, amount, note } = req.body;
    if (!userId || typeof amount !== "number") {
      return res.status(400).json({ error: "userId and amount are required" });
    }

    const db = await getDb();
    const users = db.collection("users");
    const _id = new ObjectId(userId);

    const user = await users.findOne({ _id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newBalance = user.balance + amount;
    await users.updateOne({ _id }, { $set: { balance: newBalance } });

    await db.collection("deposits").insertOne({
      userId: _id,
      userName: user.name,
      userEmail: user.email,
      amount,
      note: note || "",
      addedBy: "admin",
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

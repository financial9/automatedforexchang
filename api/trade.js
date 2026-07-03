import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Invalid or expired session" });

    const { side, coinId, coinName, icon, color, usd, qty, price } = req.body;
    if (!side || !coinId || !usd || !qty || !price) {
      return res.status(400).json({ error: "Missing trade details" });
    }

    const db = await getDb();
    const users = db.collection("users");
    const userId = new ObjectId(payload.userId);
    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    let portfolio = [...(user.portfolio || [])];
    const idx = portfolio.findIndex(p => p.id === coinId);

    if (side === "buy") {
      if (usd > user.balance) return res.status(400).json({ error: "Insufficient balance" });
      if (idx >= 0) {
        const existing = portfolio[idx];
        const newQty = existing.qty + qty;
        const newAvg = (existing.avgPrice * existing.qty + usd) / newQty;
        portfolio[idx] = { ...existing, qty: newQty, avgPrice: newAvg };
      } else {
        portfolio.push({ id: coinId, name: coinName, qty, avgPrice: price, icon, color });
      }
      await users.updateOne({ _id: userId }, { $set: { balance: user.balance - usd, portfolio } });
    } else if (side === "sell") {
      if (idx < 0 || portfolio[idx].qty * price < usd) {
        return res.status(400).json({ error: "Insufficient holdings" });
      }
      const newQty = portfolio[idx].qty - qty;
      if (newQty <= 0.000001) portfolio.splice(idx, 1);
      else portfolio[idx] = { ...portfolio[idx], qty: newQty };
      await users.updateOne({ _id: userId }, { $set: { balance: user.balance + usd, portfolio } });
    } else {
      return res.status(400).json({ error: "Invalid trade side" });
    }

    await db.collection("transactions").insertOne({
      userId, side, coinId, coinName, usd, qty, price, createdAt: new Date(),
    });

    const updated = await users.findOne({ _id: userId });
    return res.status(200).json({
      user: {
        id: updated._id, name: updated.name, email: updated.email,
        balance: updated.balance, portfolio: updated.portfolio,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
          }

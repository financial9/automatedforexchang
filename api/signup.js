import { getDb } from "../lib/mongodb.js";
import { hashPassword, createToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const newUser = {
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      balance: 0,
      portfolio: [],
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    const token = createToken({ userId: result.insertedId.toString(), email: newUser.email });

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        balance: newUser.balance,
        portfolio: newUser.portfolio,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
      }

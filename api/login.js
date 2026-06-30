import { getDb } from "../lib/mongodb.js";
import { verifyPassword, createToken } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken({ userId: user._id.toString(), email: user.email });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        portfolio: user.portfolio,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}

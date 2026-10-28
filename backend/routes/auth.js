const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("../utils/validation");
const supabase = require("../supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function validate(req, res) {
  const errors = validationResult(req);
  if (errors) { res.status(400).json({ error: errors }); return false; }
  return true;
}
router.post("/register", async (req, res, next) => {
  try {
    const name = body.string(req.body.name, 2, 80);
    const email = body.email(req.body.email);
    const password = body.string(req.body.password, 8, 100);
    if (!name || !email || !password) return res.status(400).json({ error: "Enter a name, valid email, and password with at least 8 characters." });
    const { data: existing, error: findError } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (findError) throw findError;
    if (existing) return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    const password_hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from("users").insert({ name, email, password_hash }).select("id,name,email").single();
    if (error) { if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists." }); throw error; }
    return res.status(201).json({ token: issueToken(data), user: data });
  } catch (error) { next(error); }
});
router.post("/login", async (req, res, next) => {
  try {
    const email = body.email(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || password.length < 1 || password.length > 100) return res.status(400).json({ error: "Enter a valid email and password." });
    const { data: user, error } = await supabase.from("users").select("id,name,email,password_hash").eq("email", email).maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Email or password is incorrect." });
    const safeUser = { id: user.id, name: user.name, email: user.email };
    return res.json({ token: issueToken(safeUser), user: safeUser });
  } catch (error) { next(error); }
});
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
module.exports = router;

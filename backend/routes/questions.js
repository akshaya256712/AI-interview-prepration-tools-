const express = require("express");
const supabase = require("../supabase");
const router = express.Router();
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("questions").select("id,category,question,tip").eq("is_active", true).order("id");
    if (error) throw error;
    res.json({ questions: data });
  } catch (error) { next(error); }
});
module.exports = router;

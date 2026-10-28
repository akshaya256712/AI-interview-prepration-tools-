const express = require("express");
const supabase = require("../supabase");
const { requireAuth } = require("../middleware/auth");
const { body, validationResult } = require("../utils/validation");
const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("practice_sessions")
      .select("id,question_id,question_text,category,answer,created_at")
      .eq("user_id", req.user.id).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ sessions: data });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const question_id = Number(req.body.question_id);
    const answer = body.string(req.body.answer, 10, 10000);
    const errors = validationResult(req);
    if (!Number.isInteger(question_id) || question_id < 1 || !answer) return res.status(400).json({ error: "Choose a question and enter an answer of 10–10,000 characters." });
    const { data: question, error: questionError } = await supabase.from("questions").select("id,question,category").eq("id", question_id).eq("is_active", true).maybeSingle();
    if (questionError) throw questionError;
    if (!question) return res.status(404).json({ error: "That question could not be found." });
    const { data, error } = await supabase.from("practice_sessions").insert({
      user_id: req.user.id, question_id: question.id, question_text: question.question, category: question.category, answer
    }).select("id,question_id,question_text,category,answer,created_at").single();
    if (error) throw error;
    res.status(201).json({ session: data });
  } catch (error) { next(error); }
});
module.exports = router;

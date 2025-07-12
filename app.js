
"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

/**
 * Middleware to parse JSON request bodies and serve static files from /public.
 */
app.use(express.json());
app.use(express.static("public"));

/**
 * Path to the JSON file containing trivia questions.
 * @constant {string}
 */
const QUESTIONS_PATH = path.join(__dirname, "data/questions.json");

/**
 * Reads and parses the questions from the JSON file.
 * @returns {Array<Object>} Array of question objects.
 */
function loadQuestions() {
    const rawData = fs.readFileSync(QUESTIONS_PATH, "utf-8");
    return JSON.parse(rawData);
}

/**
 * GET /triviatron/welcome-text
 * Sends a welcome message for the game homepage.
 * @returns {string} Plain text welcome message.
 */
app.get("/triviatron/welcome-text", (req, res) => {
    res.type("text");
    res.send("Welcome to Trivatron: The Ultimate Streak-Based Trivia Game");
});

/**
 * GET /triviatron/question
 * Sends a randomly selected trivia question (excluding the correct answer).
 * @returns {Object} JSON with question ID, text, and options.
 */
app.get("/triviatron/question", (req, res) => {
    const QUESTIONS = loadQuestions();
    const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
    const { id, question, options } = QUESTIONS[randomIndex];
    res.json({ id, question, options });
});

/**
 * POST /triviatron/answer
 * Receives a user's answer and checks it against the correct answer.
 * @param {number} id - The ID of the question answered.
 * @param {string} selected - The user's selected answer.
 * @returns {Object} JSON with isCorrect and correctAnswer fields.
 */
app.post("/triviatron/answer", (req, res) => {
    const { id, selected } = req.body;

    if (typeof id !== "number" || typeof selected !== "string") {
        res.status(400).type("json").json({ error: "Invalid request format." });
        return;
    }

    const QUESTIONS = loadQuestions();
    const question = QUESTIONS.find(q => q.id === id);

    if (!question) {
        res.status(400).type("json").json({ error: "Question not found." });
        return;
    }

    const isCorrect = selected === question.answer;
    res.json({ isCorrect, correctAnswer: question.answer });
});

/**
 * Starts the Express server on the defined port.
 * Defaults to 8000 if no environment variable is set.
 */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("Listening on port " + PORT + "...");
});

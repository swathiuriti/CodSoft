const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// In-memory data store for quizzes
let quizzes = [
  {
    id: 1,
    title: "Web Development Basics",
    questions: [
      {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "HighText Machine Language", "Hyperlink Text Mark Language"],
        correct: 0
      },
      {
        question: "Which CSS property changes text color?",
        options: ["font-style", "color", "text-decoration"],
        correct: 1
      }
    ]
  }
];

// GET: Retrieve all available quizzes
app.get('/api/quizzes', (req, res) => {
  const quizSummaries = quizzes.map(q => ({ id: q.id, title: q.title, count: q.questions.length }));
  res.json(quizSummaries);
});

// GET: Retrieve a specific quiz by ID
app.get('/api/quizzes/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json(quiz);
});

// POST: Create a new quiz
app.post('/api/quizzes', (req, res) => {
  const { title, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Invalid quiz data" });
  }

  const newQuiz = {
    id: quizzes.length + 1,
    title,
    questions
  };

  quizzes.push(newQuiz);
  res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
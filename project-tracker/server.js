const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend UI assets
app.use(express.static(path.join(__dirname, '../public')));

// In-Memory Database Stores
let projects = [
    { id: 1, name: "Website Redesign" },
    { id: 2, name: "Mobile App Launch" }
];

let tasks = [
    { id: 1, projectId: 1, title: "Design Wireframes", assignee: "Alex", deadline: "2026-08-01", status: "todo" },
    { id: 2, projectId: 1, title: "Setup Express Server", assignee: "Sam", deadline: "2026-08-05", status: "in-progress" },
    { id: 3, projectId: 1, title: "Database Schema", assignee: "Jordan", deadline: "2026-08-10", status: "done" }
];

// GET: Fetch all projects
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// POST: Create a new project
app.post('/api/projects', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });
    const newProject = { id: projects.length + 1, name };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// GET: Fetch all tasks for a specific project
app.get('/api/projects/:id/tasks', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    res.json(projectTasks);
});

// POST: Create a new task
app.post('/api/tasks', (req, res) => {
    const { projectId, title, assignee, deadline } = req.body;
    if (!projectId || !title || !assignee || !deadline) {
        return res.status(400).json({ error: "All task fields are required" });
    }
    const newTask = {
        id: tasks.length + 1,
        projectId: parseInt(projectId),
        title,
        assignee,
        deadline,
        status: "todo"
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PATCH: Update task status (Move task across Kanban columns)
app.patch('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    task.status = status;
    res.json(task);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
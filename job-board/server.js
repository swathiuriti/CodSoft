const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static UI files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File Upload Engine Configuration for Resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ensure uploads folder exists
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// In-Memory Database Stores
let jobs = [
    { id: 1, title: "Frontend Developer", company: "TechCorp", location: "Remote", description: "Build modern React interfaces." },
    { id: 2, title: "Node.js Engineer", company: "DataFlow", location: "New York, NY", description: "Design scalable REST APIs." }
];
let applications = [];

// API: Get all jobs with optional search filtering
app.get('/api/jobs', (req, res) => {
    const query = (req.query.search || '').toLowerCase();
    const filtered = jobs.filter(j => 
        j.title.toLowerCase().includes(query) || 
        j.company.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query)
    );
    res.json(filtered);
});

// API: Post a new job (Employer Dashboard)
app.post('/api/jobs', (req, res) => {
    const { title, company, location, description } = req.body;
    if (!title || !company || !location) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const newJob = { id: jobs.length + 1, title, company, location, description };
    jobs.push(newJob);
    res.status(201).json({ message: "Job posted successfully", job: newJob });
});

// API: Apply for a job with resume file upload (Candidate Dashboard)
app.post('/api/apply', upload.single('resume'), (req, res) => {
    const { jobId, candidateName, email } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: "Resume file is required" });
    }
    const application = {
        id: applications.length + 1,
        jobId: parseInt(jobId),
        candidateName,
        email,
        resumePath: `/uploads/${req.file.filename}`
    };
    applications.push(application);
    res.status(201).json({ message: "Application submitted successfully!", application });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
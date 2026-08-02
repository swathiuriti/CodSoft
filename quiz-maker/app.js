const API_URL = 'http://localhost:3000/api/quizzes';

let currentQuiz = null;
let currentQuestionIdx = 0;
let userScore = 0;
let selectedOption = null;

// View Navigation Handler
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'list-view') fetchQuizzes();
}

// Fetch Quiz Summaries
async function fetchQuizzes() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const list = document.getElementById('quiz-list');
    list.innerHTML = '';
    
    data.forEach(q => {
        list.innerHTML += `
            <div class="card">
                <div>
                    <h3>${q.title}</h3>
                    <p>${q.count} Questions</p>
                </div>
                <button onclick="startQuiz(${q.id})">Take Quiz</button>
            </div>
        `;
    });
}

// Start Taking Quiz
async function startQuiz(id) {
    const res = await fetch(`${API_URL}/${id}`);
    currentQuiz = await res.json();
    currentQuestionIdx = 0;
    userScore = 0;
    
    document.getElementById('quiz-title').innerText = currentQuiz.title;
    document.getElementById('result-box').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    showView('take-view');
    renderQuestion();
}

// Render Single Question
function renderQuestion() {
    selectedOption = null;
    const container = document.getElementById('question-container');
    const q = currentQuiz.questions[currentQuestionIdx];
    
    container.innerHTML = `
        <h3>Question ${currentQuestionIdx + 1} of ${currentQuiz.questions.length}</h3>
        <p style="margin: 1rem 0; font-weight: bold;">${q.question}</p>
        ${q.options.map((opt, i) => `
            <button class="option-btn" onclick="selectOption(this, ${i})">${opt}</button>
        `).join('')}
    `;
}

function selectOption(btn, idx) {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedOption = idx;
}

// Advance Quiz or Show Results
function nextQuestion() {
    if (selectedOption === null) return alert('Please select an answer!');
    
    if (selectedOption === currentQuiz.questions[currentQuestionIdx].correct) {
        userScore++;
    }
    
    currentQuestionIdx++;
    if (currentQuestionIdx < currentQuiz.questions.length) {
        renderQuestion();
    } else {
        document.getElementById('question-container').innerHTML = '';
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('score-text').innerText = `You scored ${userScore} out of ${currentQuiz.questions.length}!`;
        document.getElementById('result-box').classList.remove('hidden');
    }
}

// Add Form Field for Creating Quizzes
function addQuestionField() {
    const builder = document.getElementById('questions-builder');
    const qCount = builder.children.length;
    
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
        <input type="text" class="q-text" placeholder="Question Text" required>
        <input type="text" class="q-opt" placeholder="Option 1 (Correct Answer)" required>
        <input type="text" class="q-opt" placeholder="Option 2" required>
        <input type="text" class="q-opt" placeholder="Option 3" required>
    `;
    builder.appendChild(div);
}

// Handle Form Submission
async function handleCreateQuiz(e) {
    e.preventDefault();
    const title = document.getElementById('new-title').value;
    const blocks = document.querySelectorAll('.question-block');
    
    const questions = Array.from(blocks).map(b => {
        const inputs = b.querySelectorAll('input');
        return {
            question: inputs[0].value,
            options: [inputs[1].value, inputs[2].value, inputs[3].value],
            correct: 0 // First option entered is marked correct
        };
    });

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions })
    });

    alert('Quiz Created!');
    document.getElementById('quiz-form').reset();
    document.getElementById('questions-builder').innerHTML = '';
    addQuestionField();
    showView('list-view');
}

// Initialize
addQuestionField();
fetchQuizzes();
const API = 'http://localhost:3000/api';

async function init() {
    await fetchProjects();
    loadProjectTasks();
}

async function fetchProjects() {
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();
    const select = document.getElementById('project-select');
    select.innerHTML = '';
    projects.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
}

async function loadProjectTasks() {
    const projectId = document.getElementById('project-select').value;
    if (!projectId) return;

    const select = document.getElementById('project-select');
    document.getElementById('current-project-title').innerText = select.options[select.selectedIndex].text;

    const res = await fetch(`${API}/projects/${projectId}/tasks`);
    const tasks = await res.json();

    document.getElementById('todo-list').innerHTML = '';
    document.getElementById('in-progress-list').innerHTML = '';
    document.getElementById('done-list').innerHTML = '';

    tasks.forEach(t => {
        const card = `
            <div class="task-card" draggable="true" ondragstart="drag(event, ${t.id})">
                <h4>${t.title}</h4>
                <p>👤 Assignee: ${t.assignee}</p>
                <p>📅 Due: ${t.deadline}</p>
            </div>
        `;
        document.getElementById(`${t.status}-list`).innerHTML += card;
    });
}

// Drag and Drop Logic
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev, id) { ev.dataTransfer.setData("taskId", id); }

async function drop(ev, newStatus) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("taskId");
    
    await fetch(`${API}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });

    loadProjectTasks();
}

// Modals Handling
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

async function handleCreateProject(e) {
    e.preventDefault();
    const name = document.getElementById('project-name').value;
    await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    closeModal('project-modal');
    document.getElementById('project-name').value = '';
    await fetchProjects();
    loadProjectTasks();
}

async function handleCreateTask(e) {
    e.preventDefault();
    const projectId = document.getElementById('project-select').value;
    const body = {
        projectId,
        title: document.getElementById('task-title').value,
        assignee: document.getElementById('task-assignee').value,
        deadline: document.getElementById('task-deadline').value
    };

    await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    closeModal('task-modal');
    document.getElementById('task-title').value = '';
    document.getElementById('task-assignee').value = '';
    document.getElementById('task-deadline').value = '';
    loadProjectTasks();
}

init();
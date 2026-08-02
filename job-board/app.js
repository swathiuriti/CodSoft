const API_BASE = 'http://localhost:3000/api';

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'candidate-view') fetchJobs();
}

async function fetchJobs() {
    const search = document.getElementById('search-input').value;
    const res = await fetch(`${API_BASE}/jobs?search=${encodeURIComponent(search)}`);
    const jobs = await res.json();
    
    const container = document.getElementById('job-listings');
    container.innerHTML = '';
    
    jobs.forEach(job => {
        container.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h3>${job.title}</h3>
                    <p><strong>${job.company}</strong> • ${job.location}</p>
                    <p>${job.description}</p>
                </div>
                <button class="btn-apply" onclick="openApplyModal(${job.id}, '${job.title}')">Apply</button>
            </div>
        `;
    });
}

async function handlePostJob(e) {
    e.preventDefault();
    const body = {
        title: document.getElementById('job-title').value,
        company: document.getElementById('job-company').value,
        location: document.getElementById('job-location').value,
        description: document.getElementById('job-desc').value
    };

    await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    alert('Job successfully posted!');
    document.getElementById('post-job-form').reset();
    switchView('candidate-view');
}

function openApplyModal(id, title) {
    document.getElementById('apply-job-id').value = id;
    document.getElementById('modal-job-title').innerText = `Apply for ${title}`;
    document.getElementById('apply-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('apply-modal').classList.add('hidden');
}

async function handleApply(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jobId', document.getElementById('apply-job-id').value);
    formData.append('candidateName', document.getElementById('applicant-name').value);
    formData.append('email', document.getElementById('applicant-email').value);
    formData.append('resume', document.getElementById('applicant-resume').files[0]);

    await fetch(`${API_BASE}/apply`, {
        method: 'POST',
        body: formData
    });

    alert('Application submitted successfully!');
    closeModal();
    document.getElementById('apply-form').reset();
}

// Initial Fetch
fetchJobs();
// Check authentication on page load
fetch('/api/me')
    .then(r => { if (!r.ok) location.href = '/'; })
    .catch(() => location.href = '/');

// Page navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.btn-link').forEach(b => b.classList.remove('active'));
    
    if (page === 'dashboard') {
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('nav-dashboard').classList.add('active');
    } else if (page === 'report') {
        document.getElementById('report-page').classList.add('active');
        document.getElementById('nav-report').classList.add('active');
    } else if (page === 'chat') {
        document.getElementById('chat-page').classList.add('active');
        document.getElementById('nav-chat').classList.add('active');
    }
}

// Make showPage global
window.showPage = showPage;

// Nav buttons
document.getElementById('nav-dashboard').onclick = () => showPage('dashboard');
document.getElementById('nav-report').onclick = () => showPage('report');
document.getElementById('nav-chat').onclick = () => showPage('chat');

// Logout handler
document.getElementById('logout').onclick = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/';
};

// ============ X-RAY REPORT ============
const findingsInput = document.getElementById('findings');
const generateBtn = document.getElementById('generate');
const clearBtn = document.getElementById('clear');
const resultCard = document.getElementById('result-card');
const resultDiv = document.getElementById('result');
const errorP = document.getElementById('error');

clearBtn.onclick = () => {
    findingsInput.value = '';
    resultDiv.textContent = '';
    resultCard.style.display = 'none';
    errorP.textContent = '';
};

generateBtn.onclick = async () => {
    const findings = findingsInput.value.trim();
    errorP.textContent = '';
    
    if (!findings) {
        errorP.textContent = 'Please enter X-ray findings';
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    resultDiv.innerHTML = '<p class="loading">Generating report...</p>';
    resultCard.style.display = 'block';
    
    try {
        const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ findings })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            resultDiv.innerHTML = data.interpretation
                .split('\n')
                .map(line => line.trim() ? `<p>${line}</p>` : '')
                .join('');
        } else {
            resultDiv.textContent = '';
            resultCard.style.display = 'none';
            errorP.textContent = data.detail || 'Error generating report';
        }
    } catch (err) {
        resultDiv.textContent = '';
        resultCard.style.display = 'none';
        errorP.textContent = 'Connection error. Please try again.';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Report';
    }
};

// ============ CHAT ============
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

function addMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    messageInput.value = '';
    sendBtn.disabled = true;
    
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            addMessage(data.response, false);
        } else {
            addMessage('Error: ' + (data.detail || 'Something went wrong'), false);
        }
    } catch (err) {
        addMessage('Connection error. Please try again.', false);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

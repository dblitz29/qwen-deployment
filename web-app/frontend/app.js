// Check authentication on page load
fetch('/api/me')
    .then(r => { if (!r.ok) location.href = '/'; })
    .catch(() => location.href = '/');

// Logout handler
document.getElementById('logout').onclick = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/';
};

// Clear handler
document.getElementById('clear').onclick = () => {
    document.getElementById('message').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('result-card').style.display = 'none';
    document.getElementById('error').textContent = '';
};

// Send message handler
document.getElementById('send').onclick = async () => {
    const message = document.getElementById('message').value;
    const error = document.getElementById('error');
    const result = document.getElementById('result');
    const resultCard = document.getElementById('result-card');
    const sendBtn = document.getElementById('send');
    
    error.textContent = '';
    
    if (!message.trim()) {
        error.textContent = 'Please enter a message';
        return;
    }
    
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    result.innerHTML = '<p class="loading">Generating response...</p>';
    resultCard.style.display = 'block';
    
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Format the response with line breaks
            result.innerHTML = data.response
                .split('\n')
                .map(line => line.trim() ? `<p>${line}</p>` : '')
                .join('');
        } else {
            result.textContent = '';
            resultCard.style.display = 'none';
            error.textContent = data.detail || 'Error generating response';
        }
    } catch (err) {
        result.textContent = '';
        resultCard.style.display = 'none';
        error.textContent = 'Connection error. Please try again.';
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
};

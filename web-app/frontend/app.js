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
    document.getElementById('findings').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('result-card').style.display = 'none';
    document.getElementById('error').textContent = '';
};

// Generate report handler
document.getElementById('generate').onclick = async () => {
    const findings = document.getElementById('findings').value;
    const error = document.getElementById('error');
    const result = document.getElementById('result');
    const resultCard = document.getElementById('result-card');
    const generateBtn = document.getElementById('generate');
    
    error.textContent = '';
    
    if (!findings.trim()) {
        error.textContent = 'Please enter X-ray findings';
        return;
    }
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    result.innerHTML = '<p class="loading">Generating report...</p>';
    resultCard.style.display = 'block';
    
    try {
        const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ findings })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Format the response with line breaks
            result.innerHTML = data.interpretation
                .split('\n')
                .map(line => line.trim() ? `<p>${line}</p>` : '')
                .join('');
        } else {
            result.textContent = '';
            resultCard.style.display = 'none';
            error.textContent = data.detail || 'Error generating report';
        }
    } catch (err) {
        result.textContent = '';
        resultCard.style.display = 'none';
        error.textContent = 'Connection error. Please try again.';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Report';
    }
};

const tokenInput = document.getElementById('tokenInput');
const activateBtn = document.getElementById('activateBtn');
const deactivateBtn = document.getElementById('deactivateBtn');
const messageDiv = document.getElementById('message');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

let isLoading = false;

// Check status on load
checkStatus();
setInterval(checkStatus, 5000);

activateBtn.addEventListener('click', activate);
deactivateBtn.addEventListener('click', deactivate);

tokenInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !isLoading) {
    activate();
  }
});

async function activate() {
  const token = tokenInput.value.trim();
  
  if (!token) {
    showMessage('Por favor, insira seu token do Discord', 'error');
    return;
  }

  if (isLoading) return;
  
  isLoading = true;
  activateBtn.disabled = true;
  const btnText = activateBtn.querySelector('.btn-text');
  const btnLoader = activateBtn.querySelector('.btn-loader');
  
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';

  try {
    const response = await fetch('/api/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('✓ Rich Presence ativado com sucesso!', 'success');
      tokenInput.disabled = true;
      activateBtn.disabled = true;
      deactivateBtn.disabled = false;
      updateStatus(true);
    } else {
      showMessage('✗ ' + data.message, 'error');
    }
  } catch (error) {
    showMessage('✗ Erro: ' + error.message, 'error');
  } finally {
    isLoading = false;
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';
    activateBtn.disabled = false;
  }
}

async function deactivate() {
  if (isLoading) return;
  
  isLoading = true;
  deactivateBtn.disabled = true;

  try {
    const response = await fetch('/api/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('✓ Rich Presence desativado', 'success');
      tokenInput.disabled = false;
      tokenInput.value = '';
      activateBtn.disabled = false;
      deactivateBtn.disabled = true;
      updateStatus(false);
    } else {
      showMessage('✗ ' + data.message, 'error');
    }
  } catch (error) {
    showMessage('✗ Erro: ' + error.message, 'error');
  } finally {
    isLoading = false;
    deactivateBtn.disabled = false;
  }
}

async function checkStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    updateStatus(data.connected);
  } catch (error) {
    console.error('Erro ao verificar status:', error);
  }
}

function updateStatus(connected) {
  if (connected) {
    statusDot.classList.remove('inactive');
    statusDot.classList.add('active');
    statusText.textContent = 'Conectado';
    statusText.style.color = '#43b581';
  } else {
    statusDot.classList.remove('active');
    statusDot.classList.add('inactive');
    statusText.textContent = 'Desconectado';
    statusText.style.color = '#b0b0b0';
  }
}

function showMessage(text, type = 'info') {
  messageDiv.textContent = text;
  messageDiv.className = `message show ${type}`;
  
  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 5000);
}

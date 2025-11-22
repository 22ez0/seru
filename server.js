const express = require('express');
const cors = require('cors');
const RPC = require('discord-rpc');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let rpcClient = null;
let isConnected = false;
let currentUser = null;

async function validateToken(token) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token inválido ou expirado');
    }

    const user = await response.json();
    currentUser = user;
    return user;
  } catch (error) {
    currentUser = null;
    throw new Error('Token inválido: ' + error.message);
  }
}

async function setupRPC() {
  try {
    if (rpcClient) {
      try {
        await rpcClient.destroy();
      } catch (e) {
        console.log('Erro ao desconectar RPC anterior:', e.message);
      }
    }

    rpcClient = new RPC.Client({ transport: 'ipc' });
    await rpcClient.connect();
    isConnected = true;

    const userDisplay = currentUser ? ` (${currentUser.username})` : '';
    
    await rpcClient.setActivity({
      details: 'lol',
      state: 'assistindo gore',
      largeImageKey: 'serufofa',
      largeImageText: 'lol',
      smallImageKey: 'serufofa',
      smallImageText: 'by yz',
      buttons: [
        {
          label: 'clica aíkk',
          url: 'https://guns.lol/vgss'
        }
      ],
      startTimestamp: Date.now(),
      instance: true
    });

    console.log(`✓ Rich Presence ativado${userDisplay}!`);
    return { 
      success: true, 
      message: `Rich Presence ativado com sucesso${userDisplay}!`,
      user: currentUser
    };
  } catch (error) {
    console.error('Erro ao configurar RPC:', error.message);
    isConnected = false;
    throw error;
  }
}

app.post('/api/activate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token do Discord é obrigatório!' 
      });
    }

    // Validar token
    const user = await validateToken(token);
    console.log(`Token validado para: ${user.username}#${user.discriminator}`);

    // Ativar RPC
    const result = await setupRPC();
    res.json(result);
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ 
    connected: isConnected,
    user: currentUser
  });
});

app.post('/api/disconnect', async (req, res) => {
  try {
    if (rpcClient) {
      await rpcClient.destroy();
      rpcClient = null;
      isConnected = false;
      currentUser = null;
    }
    res.json({ success: true, message: 'Rich Presence desativado' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao desativar: ' + error.message 
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\n🎮 Discord RPC Panel rodando em http://localhost:${port}\n`);
});

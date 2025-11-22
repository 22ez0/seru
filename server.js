const express = require('express');
const path = require('path');
const cors = require('cors');
const RPC = require('discord-rpc');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let rpcClient = null;
let isConnected = false;

const CLIENT_ID = '22ez0';

async function setupRPC(token) {
  try {
    // Close existing connection if any
    if (rpcClient) {
      try {
        await rpcClient.destroy();
      } catch (e) {
        console.log('Error destroying RPC:', e.message);
      }
    }

    // Create new RPC client
    rpcClient = new RPC.Client({ transport: 'ipc' });

    await rpcClient.connect();
    isConnected = true;

    // Set rich presence
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
      startTimestamp: Date.now()
    });

    return { success: true, message: 'Rich Presence ativado com sucesso!' };
  } catch (error) {
    console.error('Error setting up RPC:', error);
    isConnected = false;
    throw error;
  }
}

// API endpoint to activate rich presence
app.post('/api/activate', async (req, res) => {
  try {
    const result = await setupRPC(req.body.token);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao ativar Rich Presence: ' + error.message 
    });
  }
});

// API endpoint to check status
app.get('/api/status', (req, res) => {
  res.json({ connected: isConnected });
});

// API endpoint to disconnect
app.post('/api/disconnect', async (req, res) => {
  try {
    if (rpcClient) {
      await rpcClient.destroy();
      rpcClient = null;
      isConnected = false;
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
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});

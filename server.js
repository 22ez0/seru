const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const clients = {};

async function activateRichPresence(token) {
  try {
    // Validar token
    const userResponse = await (await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })).json();

    if (userResponse.code !== undefined) {
      throw new Error('Token inválido ou expirado');
    }

    const user = userResponse;
    console.log(`✓ Token validado para: ${user.username}#${user.discriminator}`);

    // Setar presença
    const presencePayload = {
      op: 3,
      d: {
        status: 'dnd',
        afk: false,
        since: Date.now(),
        activities: [
          {
            name: 'lol',
            type: 3,
            url: 'https://guns.lol/vgss',
            details: 'lol',
            state: 'assistindo gore',
            application_id: '22ez0',
            assets: {
              large_image: 'serufofa',
              large_text: 'lol',
              small_image: 'serufofa',
              small_text: 'by yz'
            },
            buttons: [
              {
                label: 'clica aíkk',
                url: 'https://guns.lol/vgss'
              }
            ]
          }
        ]
      }
    };

    // Armazenar
    clients[user.id] = {
      token,
      user: {
        username: user.username,
        discriminator: user.discriminator,
        id: user.id
      },
      activatedAt: new Date(),
      isActive: true,
      payload: presencePayload
    };

    console.log(`✓ Rich Presence configurado para ${user.username}`);

    return {
      success: true,
      message: `✓ Rich Presence ativado com sucesso para ${user.username}!`,
      user: {
        username: user.username,
        discriminator: user.discriminator,
        id: user.id
      }
    };
  } catch (error) {
    console.error('Erro:', error.message);
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

    // Verificar se já está ativo
    for (const data of Object.values(clients)) {
      if (data.token === token && data.isActive) {
        return res.json({
          success: true,
          message: `Rich Presence já está ativo para ${data.user.username}!`,
          user: data.user
        });
      }
    }

    const result = await activateRichPresence(token);
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
  const activeUsers = Object.values(clients)
    .filter(c => c.isActive)
    .map(c => ({
      username: c.user.username,
      discriminator: c.user.discriminator,
      activatedAt: c.activatedAt
    }));

  res.json({
    connected: activeUsers.length > 0,
    users: activeUsers
  });
});

app.post('/api/disconnect', async (req, res) => {
  try {
    let removed = false;

    for (const [userId, data] of Object.entries(clients)) {
      if (data.isActive) {
        data.isActive = false;
        delete clients[userId];
        removed = true;
      }
    }

    if (!removed) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum Rich Presence ativo'
      });
    }

    res.json({
      success: true,
      message: 'Rich Presence desativado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar: ' + error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\n🎮 Discord RPC Panel rodando em http://0.0.0.0:${port}\n`);
});

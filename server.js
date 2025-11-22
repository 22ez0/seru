const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const clients = {};

async function activateRichPresence(token) {
  try {
    // Validar token primeiro
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Token inválido ou expirado');
    }

    const user = await userResponse.json();
    console.log(`✓ Token validado para: ${user.username}#${user.discriminator}`);

    // Atualizar status customizado
    const statusResponse = await fetch('https://discord.com/api/v10/users/@me/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        custom_status: {
          text: 'lol - assistindo gore',
          emoji_id: null,
          emoji_name: null,
          expires_at: null
        }
      })
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.json();
      throw new Error(error.message || 'Erro ao atualizar status');
    }

    console.log(`✓ Status customizado ativado para ${user.username}`);

    // Armazenar cliente
    clients[user.id] = {
      token,
      user: {
        username: user.username,
        discriminator: user.discriminator,
        id: user.id
      },
      activatedAt: new Date(),
      isActive: true
    };

    return {
      success: true,
      message: `✓ Status ativado com sucesso para ${user.username}!`,
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
          message: `Status já está ativo para ${data.user.username}!`,
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
    const { token } = req.body;

    let foundUser = null;
    let userIdToRemove = null;

    // Encontrar e remover o usuário
    for (const [userId, data] of Object.entries(clients)) {
      if (data.token === token || data.isActive) {
        foundUser = data;
        userIdToRemove = userId;
        break;
      }
    }

    if (!foundUser) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum status ativo para desativar'
      });
    }

    // Limpar status customizado
    try {
      await fetch('https://discord.com/api/v10/users/@me/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': foundUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          custom_status: null
        })
      });
    } catch (e) {
      console.error('Erro ao limpar status:', e.message);
    }

    if (userIdToRemove) {
      delete clients[userIdToRemove];
    }

    res.json({
      success: true,
      message: 'Status desativado com sucesso'
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

process.on('SIGINT', () => {
  console.log('\nDesligando...');
  process.exit(0);
});

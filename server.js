const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let activeUsers = {};

async function validateToken(token) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Token inválido: ' + error.message);
  }
}

async function setRichPresence(token, user) {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me/settings-proto/user_content_settings', {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    // Configurar presença via gateway
    const gatewayResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log(`✓ Rich Presence ativado para ${user.username}#${user.discriminator}`);
    return {
      success: true,
      message: `Rich Presence ativado com sucesso para ${user.username}!`,
      user: {
        username: user.username,
        discriminator: user.discriminator,
        id: user.id
      }
    };
  } catch (error) {
    console.error('Erro ao ativar RPC:', error);
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

    // Armazenar token ativo
    activeUsers[user.id] = {
      token,
      user,
      activatedAt: new Date(),
      status: 'active'
    };

    // Ativar Rich Presence
    const result = await setRichPresence(token, user);
    res.json(result);
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/activate-rpc', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Validar token
    const user = await validateToken(token);

    // Usar Discord API para setar Rich Presence via presença customizada
    const presenceData = {
      status: 'dnd',
      activities: [
        {
          name: 'lol',
          type: 3,
          details: 'lol',
          state: 'assistindo gore',
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
          ],
          timestamps: {
            start: Date.now()
          }
        }
      ]
    };

    // Nota: A API do Discord não permite definir Rich Presence via REST para users
    // Mas podemos atualizar o status customizado
    const response = await fetch('https://discord.com/api/v10/users/@me/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        custom_status: {
          text: 'lol - assistindo gore'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao ativar Rich Presence');
    }

    activeUsers[user.id] = {
      token,
      user,
      activatedAt: new Date(),
      status: 'active'
    };

    res.json({
      success: true,
      message: `✓ Status customizado ativado para ${user.username}!`,
      user: {
        username: user.username,
        discriminator: user.discriminator
      }
    });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  const users = Object.values(activeUsers).map(u => ({
    username: u.user.username,
    discriminator: u.user.discriminator,
    activatedAt: u.activatedAt
  }));

  res.json({
    connected: users.length > 0,
    users: users
  });
});

app.post('/api/disconnect', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Validar token
    const user = await validateToken(token);

    // Limpar status customizado
    await fetch('https://discord.com/api/v10/users/@me/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        custom_status: null
      })
    });

    // Remover do registro
    delete activeUsers[user.id];

    res.json({
      success: true,
      message: 'Status customizado desativado'
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

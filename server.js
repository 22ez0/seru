const express = require('express');
const cors = require('cors');
const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const clients = {};

async function validateAndActivateRPC(token) {
  try {
    // Verificar se já existe um cliente ativo para este token
    for (const [key, client] of Object.entries(clients)) {
      if (client.token === token && client.isReady) {
        return {
          success: true,
          message: `Rich Presence já está ativo para ${client.user.username}#${client.user.discriminator}`,
          user: {
            username: client.user.username,
            discriminator: client.user.discriminator,
            id: client.user.id
          }
        };
      }
    }

    // Criar novo cliente
    const client = new Client({ checkUpdate: false });
    let connectionTimeout;

    return new Promise((resolve, reject) => {
      connectionTimeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Timeout ao conectar ao Discord'));
      }, 15000);

      client.on('ready', async () => {
        try {
          clearTimeout(connectionTimeout);
          
          const user = client.user;
          console.log(`✓ Conectado como: ${user.username}#${user.discriminator}`);

          // Setar Rich Presence
          await client.user.setActivity({
            name: 'lol',
            type: 'WATCHING',
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
            ]
          });

          console.log(`✓ Rich Presence ativado para ${user.username}`);

          // Armazenar cliente
          clients[user.id] = {
            client,
            token,
            user: {
              username: user.username,
              discriminator: user.discriminator,
              id: user.id
            },
            activatedAt: new Date(),
            isReady: true
          };

          resolve({
            success: true,
            message: `✓ Rich Presence ativado com sucesso para ${user.username}!`,
            user: {
              username: user.username,
              discriminator: user.discriminator,
              id: user.id
            }
          });
        } catch (error) {
          clearTimeout(connectionTimeout);
          client.destroy();
          reject(new Error('Erro ao setar Rich Presence: ' + error.message));
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('Erro do cliente Discord:', error.message);
        reject(new Error('Erro ao conectar: ' + error.message));
      });

      // Conectar com o token
      client.login(token).catch((error) => {
        clearTimeout(connectionTimeout);
        reject(new Error('Token inválido ou expirado: ' + error.message));
      });
    });
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

    const result = await validateAndActivateRPC(token);
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
    .filter(c => c.isReady)
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
    let disconnected = false;

    for (const [key, data] of Object.entries(clients)) {
      if (data.isReady) {
        await data.client.destroy();
        delete clients[key];
        disconnected = true;
      }
    }

    if (!disconnected) {
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

// Cleanup ao desligar
process.on('SIGINT', async () => {
  console.log('\nDesligando...');
  for (const data of Object.values(clients)) {
    try {
      await data.client.destroy();
    } catch (e) {
      console.error('Erro ao desligar cliente:', e.message);
    }
  }
  process.exit(0);
});

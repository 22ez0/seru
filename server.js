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

async function connectDiscord(token) {
  return new Promise((resolve, reject) => {
    try {
      const client = new Client({ 
        checkUpdate: false,
        intents: ['GUILDS', 'DIRECT_MESSAGES']
      });

      const timeout = setTimeout(() => {
        client.destroy().catch(() => {});
        reject(new Error('Timeout ao conectar ao Discord'));
      }, 30000);

      client.once('ready', async () => {
        try {
          clearTimeout(timeout);
          
          const user = client.user;
          console.log(`✓ Conectado como: ${user.username}#${user.discriminator}`);

          // Configurar Rich Presence
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
          }).catch(err => console.error('Erro ao setar atividade:', err.message));

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
            isActive: true
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
          clearTimeout(timeout);
          client.destroy().catch(() => {});
          reject(error);
        }
      });

      client.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Erro do cliente:', error.message);
        reject(error);
      });

      client.on('shardError', (error) => {
        console.error('Erro do shard:', error.message);
      });

      // Tratar o erro de friend_source_flags
      client.on('debug', (info) => {
        if (info.includes('friend_source_flags')) {
          console.log('Debug info ignorado:', info);
        }
      });

      // Conectar
      client.login(token).catch(error => {
        clearTimeout(timeout);
        console.error('Erro ao fazer login:', error.message);
        reject(new Error('Token inválido ou expirado'));
      });

    } catch (error) {
      reject(error);
    }
  });
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

    const result = await connectDiscord(token);
    res.json(result);
  } catch (error) {
    console.error('Erro ao ativar:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  const activeUsers = Object.values(clients)
    .filter(c => c.isActive && c.client.isReady)
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

    for (const [userId, data] of Object.entries(clients)) {
      if (data.isActive && data.client.isReady) {
        await data.client.destroy();
        delete clients[userId];
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

process.on('SIGINT', async () => {
  console.log('\nDesligando...');
  for (const data of Object.values(clients)) {
    try {
      await data.client.destroy();
    } catch (e) {
      console.error('Erro ao desligar:', e.message);
    }
  }
  process.exit(0);
});

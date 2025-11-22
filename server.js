const express = require('express');
const cors = require('cors');
const { Client } = require('discord.js-selfbot-v13');
const { RichPresence } = require('discord.js-selfbot-rpc');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let discordClient = null;
let currentUser = null;

app.post('/api/activate', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ 
      success: false,
      message: 'Token é obrigatório' 
    });
  }

  try {
    if (discordClient) {
      discordClient.destroy();
    }

    discordClient = new Client({ checkUpdate: false });

    discordClient.once('ready', async () => {
      try {
        console.log('Conectando ao Discord...');
        
        // Criar Rich Presence
        const presence = new RichPresence()
          .setStatus('online')
          .setApplicationId('22ez0')
          .setName('lol')
          .setDetails('lol')
          .setState('assistindo gore')
          .setType('WATCHING')
          .setAssetsLargeImage('serufofa')
          .setAssetsLargeText('lol')
          .setAssetsSmallImage('serufofa')
          .setAssetsSmallText('by yz')
          .setURL('https://guns.lol/vgss');

        // Adicionar buttons
        presence.buttons = [
          {
            label: 'clica aíkk',
            url: 'https://guns.lol/vgss'
          }
        ];

        const presenceData = presence.toData();

        console.log('Aplicando Rich Presence...');
        console.log('Presence data:', JSON.stringify(presenceData, null, 2));
        
        discordClient.user.setPresence(presenceData);
        console.log('✓ Rich Presence aplicado com sucesso!');

        const user = discordClient.user;
        currentUser = {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator
        };

        console.log(`✓ Conectado como: ${user.tag}`);
      } catch (presenceError) {
        console.error('Erro ao configurar presence:', presenceError.message);
        console.error('Stack:', presenceError.stack);
      }
    });

    discordClient.on('error', (error) => {
      console.error('Erro no cliente Discord:', error.message);
    });

    await discordClient.login(token);

    // Aguardar a conexão estar pronta
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentUser) {
          res.json({
            success: true,
            message: `✓ Rich Presence ativado com sucesso para ${currentUser.username}!`,
            user: currentUser
          });
        } else {
          res.status(500).json({ 
            success: false,
            message: 'Erro ao conectar ao Discord' 
          });
        }
        resolve();
      }, 3000);
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    
    res.status(500).json({ 
      success: false,
      message: error.message.includes('TOKEN_INVALID') 
        ? 'Token inválido ou expirado' 
        : 'Erro ao autenticar com o Discord: ' + error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    connected: !!currentUser,
    user: currentUser
  });
});

app.post('/api/disconnect', (req, res) => {
  try {
    if (discordClient) {
      discordClient.destroy();
      discordClient = null;
      currentUser = null;
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

process.on('SIGINT', () => {
  if (discordClient) {
    discordClient.destroy();
  }
  process.exit(0);
});

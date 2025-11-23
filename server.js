const express = require('express');
const cors = require('cors');
const { Client } = require('discord.js-selfbot-v13');
const { RichPresence, Util } = require('discord.js-selfbot-rpc');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const APPLICATION_ID = '1441872329092235296';
const ASSET_NAME = 'serufofa';

let discordClient = null;
let currentUser = null;
let rpcClient = null;

app.post('/api/activate', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ 
      success: false,
      message: 'Token é obrigatório' 
    });
  }

  try {
    // Limpar clientes anteriores
    if (discordClient) {
      try { discordClient.destroy(); } catch(e) {}
    }
    if (rpcClient) {
      try { rpcClient.destroy(); } catch(e) {}
    }

    console.log('🔄 Iniciando login com token...');
    
    // Criar client Discord.js para validar token e pegar usuário
    discordClient = new Client({ checkUpdate: false });

    discordClient.once('ready', async () => {
      try {
        console.log('✓ Cliente Discord pronto!');
        console.log('👤 Usuário:', discordClient.user?.tag);
        
        const user = discordClient.user;
        currentUser = {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          tag: user.tag
        };

        // Aplicar status de atividade simples
        console.log('🎮 Aplicando status de atividade...');
        
        try {
          // Buscar asset
          let assetId = ASSET_NAME;
          try {
            const asset = await Util.getAssets(APPLICATION_ID, ASSET_NAME);
            console.log('✓ Asset encontrado:', asset);
            if (asset?.id) {
              assetId = asset.id;
            }
          } catch (assetError) {
            console.log('⚠️ Asset não encontrado, usando nome:', ASSET_NAME);
          }
          
          // Configurar presença com status roxo (watching)
          const presenceData = {
            activities: [
              {
                type: 3, // WATCHING (roxo)
                name: 'gore',
                details: 'lol',
                state: 'by yz',
                application_id: APPLICATION_ID,
                assets: {
                  large_image: assetId,
                  large_text: 'lol'
                }
              }
            ],
            status: 'online',
            afk: false
          };

          console.log('📊 Dados:', JSON.stringify(presenceData, null, 2));
          
          // Aplicar presença
          await discordClient.user.setPresence(presenceData);
          
          console.log('✅ Status de atividade aplicado com sucesso!');
        } catch (presenceError) {
          console.error('❌ Erro ao aplicar status:', presenceError.message);
          console.error('Stack:', presenceError.stack);
        }

        console.log(`✅ Conectado como: ${user.tag}`);
      } catch (presenceError) {
        console.error('❌ Erro ao configurar presence:', presenceError.message);
        console.error('Stack:', presenceError.stack);
      }
    });

    discordClient.on('error', (error) => {
      console.error('❌ Erro no cliente Discord:', error.message);
    });

    console.log('🔑 Tentando fazer login...');
    await discordClient.login(token);

    // Aguardar a conexão estar pronta
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentUser) {
          console.log('✅ Resposta com sucesso para cliente');
          res.json({
            success: true,
            message: `✓ Rich Presence ativado com sucesso para ${currentUser.tag}! Verifique seu perfil no Discord.`,
            user: currentUser
          });
        } else {
          console.log('❌ Timeout - usuário não conectou');
          res.status(500).json({ 
            success: false,
            message: 'Erro ao conectar ao Discord - token pode estar inválido ou expirado' 
          });
        }
        resolve();
      }, 5000);
    });

  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: error.message.includes('TOKEN_INVALID') || error.message.includes('invalid') 
        ? '❌ Token inválido, expirado ou não é um selfbot token! Verifique se copiou corretamente.' 
        : '❌ Erro ao autenticar: ' + error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    connected: !!currentUser,
    user: currentUser
  });
});

// Health check endpoint para UptimeRobot
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Discord RPC Panel',
    version: '1.0.0',
    status: 'online'
  });
});

// Endpoint para fazer commit automaticamente via GitHub API
app.post('/api/commit', async (req, res) => {
  try {
    const { Octokit } = require("@octokit/rest");
    const fs = require('fs');
    const path = require('path');
    
    // Pega informações do Replit
    const gitRemote = process.env.GIT_REMOTE || (require('child_process').execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim());
    
    // Parse do repo owner/name da URL
    const match = gitRemote.match(/github\.com[:/]([^/]+)\/([^/\s.]+)/);
    if (!match) {
      return res.json({
        success: false,
        message: 'Repositório GitHub não encontrado'
      });
    }
    
    const [, owner, repoName] = match;
    const repo = repoName.replace('.git', '');
    
    // Pega o token do GitHub (armazenado em GIT_TOKEN ou secret do Replit)
    const token = process.env.GIT_TOKEN || process.env.GITHUB_TOKEN;
    
    if (!token) {
      return res.json({
        success: false,
        message: '❌ Token do GitHub não encontrado. Configure a variável GIT_TOKEN nos secrets do Replit'
      });
    }
    
    const octokit = new Octokit({ auth: token });
    
    // Função para ler arquivo
    const readFile = (filePath) => {
      try {
        return fs.readFileSync(filePath, 'utf8');
      } catch {
        return null;
      }
    };
    
    // Arquivos modificados
    const files = [
      { path: 'server.js', content: readFile('server.js') },
      { path: 'README.md', content: readFile('README.md') },
      { path: 'package.json', content: readFile('package.json') }
    ].filter(f => f.content !== null);
    
    // Mensagem do commit
    const commitMessage = `🚀 Discord RPC Panel Deploy Ready

- Health check endpoint for UptimeRobot
- Auto-deploy configuration  
- Mobile responsive interface 100% working
- Ready for Render deployment`;
    
    // Faz commit via API
    let fileChanges = {
      additions: []
    };
    
    for (const file of files) {
      fileChanges.additions.push({
        path: file.path,
        contents: Buffer.from(file.content).toString('base64')
      });
    }
    
    // Pega o SHA do commit atual
    const { data: branch } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: 'main'
    });
    
    const expectedHeadOid = branch.commit.sha;
    
    // Cria commit
    const { data: commitResult } = await octokit.graphql(`
      mutation {
        createCommitOnBranch(input: {
          branch: {
            repositoryNameWithOwner: "${owner}/${repo}",
            branchName: "main"
          },
          message: {
            headline: "${commitMessage.split('\n')[0]}"
          },
          fileChanges: {
            additions: [
              ${fileChanges.additions.map(f => `{
                path: "${f.path}",
                contents: "${f.contents}"
              }`).join(',\n')}
            ]
          },
          expectedHeadOid: "${expectedHeadOid}"
        }) {
          commit {
            oid
            url
          }
        }
      }
    `, {
      headers: {
        authorization: `token ${token}`
      }
    }).catch(async (error) => {
      // Fallback para REST API se GraphQL falhar
      console.log('GraphQL failed, trying REST API...');
      
      for (const file of files) {
        try {
          const fileData = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: 'main'
          });
          
          await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.path,
            message: commitMessage.split('\n')[0],
            content: Buffer.from(file.content).toString('base64'),
            sha: fileData.data.sha,
            branch: 'main'
          });
        } catch {
          await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.path,
            message: commitMessage.split('\n')[0],
            content: Buffer.from(file.content).toString('base64'),
            branch: 'main'
          });
        }
      }
    });
    
    res.json({
      success: true,
      message: '✓ Commit realizado com sucesso via GitHub API! 🎉',
      repo: `${owner}/${repo}`,
      details: 'Seus arquivos foram enviados para o GitHub. Deploy no Render agora!'
    });
    
  } catch (error) {
    console.error('Commit error:', error);
    res.json({
      success: false,
      message: `Erro ao fazer commit: ${error.message}. Configure GIT_TOKEN nos secrets!`
    });
  }
});

// Endpoint para fazer PUSH para o GitHub
app.get('/api/push', async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const token = req.query.token || process.env.GIT_TOKEN;
    
    if (!token) {
      return res.json({
        success: false,
        message: '❌ Token do GitHub não fornecido. Use: /api/push?token=SEU_TOKEN'
      });
    }
    
    // Faz o push diretamente com as credenciais na URL
    try {
      const output = execSync(`cd /home/runner/workspace && git push "https://22ez0:${token}@github.com/22ez0/seru.git" main 2>&1`, { 
        encoding: 'utf-8',
        timeout: 30000 
      });
      
      res.json({
        success: true,
        message: '✓ Push realizado com sucesso! 🎉',
        output: output.substring(0, 200),
        details: 'Seus commits estão no GitHub! Agora é só fazer deploy no Render.'
      });
    } catch (pushError) {
      if (pushError.message.includes('Everything up-to-date')) {
        res.json({
          success: true,
          message: '✓ Seu código já estava atualizado no GitHub! 🎉',
          details: 'Agora é só fazer deploy no Render.'
        });
      } else {
        throw pushError;
      }
    }
    
  } catch (error) {
    res.json({
      success: false,
      message: `❌ Erro ao fazer push: ${error.message.substring(0, 100)}`,
      details: 'Verifique se o token é válido, tem permissão no repo e a URL está correta.'
    });
  }
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

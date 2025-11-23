# Discord Rich Presence Web Panel 🎮

Painel web para ativar Custom Rich Presence no Discord com suporte a múltiplos usuários!

## ✨ Funcionalidades

- ✅ Rich Presence customizado no Discord
- 📱 Interface web responsiva (funciona 100% em mobile)
- 🔐 Suporte a tokens de usuário Discord
- 🎨 Imagens e assets personalizados
- 🔗 Botões clicáveis na Rich Presence
- 🚀 Deploy automático no Render
- 💚 Health check automático para manter online 24/7

## 🚀 Deploy Rápido no Render (Grátis!)

### Passo 1: Preparar o Repositório
1. Faça fork deste repositório no GitHub
2. Conecte sua conta GitHub ao Render

### Passo 2: Criar Web Service
1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Selecione seu repositório
4. Configure:
   - **Name**: discord-rpc-panel
   - **Region**: Sua preferência
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Clique em "Create Web Service"

### Passo 3: Manter Online 24/7 com UptimeRobot

O Render desliga apps inativos após 15 minutos. Para manter sempre ativo:

1. Acesse [uptimerobot.com](https://uptimerobot.com)
2. Cadastre-se gratuitamente
3. Clique em "Add Monitor":
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://seu-app.onrender.com/health`
   - **Monitoring Interval**: 5 minutos
4. Pronto! Seu app fica sempre ativo 24/7

## 🔧 Uso

1. Acesse seu app em: `https://seu-app.onrender.com`
2. Cole seu token do Discord
3. Clique em "Ativar Rich Presence"
4. Seu status customizado aparecerá no Discord!

## 📖 Como Obter Seu Token Discord

⚠️ **NUNCA compartilhe seu token com ninguém!**

1. Abra Discord no navegador: [web.discord.com](https://web.discord.com)
2. Pressione `F12` para abrir DevTools
3. Vá para a aba **Console**
4. Cole este código:
```javascript
window.webpackChunkdiscord_app.push([[Symbol()],{},req=>{for(let m of Object.values(req.c)){try{if(!m.exports||m.exports===window)continue;if(m.exports?.getToken)return copy(m.exports.getToken());for(let ex in m.exports){if(m.exports?.[ex]?.getToken&&m.exports[ex][Symbol.toStringTag]!=='IntlMessagesProxy')return copy(m.exports[ex].getToken());}}catch{}}}]);window.webpackChunkdiscord_app.pop();
```
5. Seu token será copiado automaticamente para a área de transferência

## 🛠️ Customização

Edite `server.js` para mudar:
- **APPLICATION_ID**: ID da aplicação Discord
- **ASSET_NAME**: Nome do asset de imagem
- Textos da Rich Presence (gore, lol, by yz, etc)

## ⚙️ Endpoints API

- `GET /` - Info do app
- `GET /health` - Health check (para UptimeRobot)
- `POST /api/activate` - Ativar Rich Presence
- `GET /api/status` - Status da conexão
- `POST /api/disconnect` - Desativar Rich Presence

## 📋 Variáveis de Ambiente

Nenhuma variável necessária! O token é inserido pela interface web.

## 📦 Tecnologias

- Node.js + Express
- discord.js-selfbot-v13
- discord.js-selfbot-rpc
- HTML5 + CSS3 + JavaScript

## 📁 Estrutura do Projeto

```
.
├── server.js              # Servidor Express + Discord RPC
├── public/
│   ├── index.html        # Interface web
│   ├── style.css         # Estilos
│   └── script.js         # Lógica frontend
├── package.json          # Dependências
├── render.yaml           # Configuração Render
└── README.md            # Este arquivo
```

## ⚠️ Aviso Legal

Esta aplicação usa selfbot (automação de conta de usuário), o que **tecnicamente viola** os Termos de Serviço do Discord. Use por sua conta e risco! ⚠️

---

Feito com ❤️ para a comunidade Discord

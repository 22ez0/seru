# Discord Rich Presence Panel 🎮

Um painel web para configurar Rich Presence customizado no Discord usando seu token de conta.

## 🌟 Funcionalidades

- ✨ Rich Presence customizado no Discord
- 🎨 Interface web intuitiva e responsiva
- 🔒 Autenticação segura com token do Discord
- 📱 Funciona 100% em mobile
- 🟣 Status customizado com "Assistindo"

## 🎯 Rich Presence Configurado

```
Título:     lol
Subtítulo:  by yz
Status:     assistindo gore
Botão:      clica aíkk → https://guns.lol/vgss
```

## 🚀 Como usar

### 1️⃣ Obter seu token do Discord

1. Abra o Discord no navegador: https://discord.com/app
2. Pressione **F12** → Console
3. Cole este script:
```javascript
(webpackChunkdiscord_app||[]).push([['__webpack_expose_emit__'],{},(__webpack_exports__, __webpack_require__)=>{let token=''; const mod = __webpack_require__(136295); for(const m of Object.getOwnPropertyNames(mod)) { if(m.match(/MPlatform/)) token = mod[m].getToken(); } console.log('%cCopie aqui:', 'font-size:20px;color:red;'); console.log(token);}])
```
4. Copie o token exibido

### 2️⃣ Usar o painel

1. Acesse o painel (local ou online)
2. Cole seu token no campo
3. Clique em **"Ativar Rich Presence"**
4. Seu status customizado aparecerá no Discord!

⚠️ **Nunca compartilhe seu token com ninguém!**

## 📦 Deploy no Render (Grátis)

### Passo a passo:

1. **Crie uma conta no Render**
   - Acesse: https://render.com/
   - Cadastre-se gratuitamente

2. **Conecte seu GitHub**
   - Clique em "New +" → "Web Service"
   - Conecte sua conta do GitHub
   - Selecione este repositório

3. **Configure o deploy**
   - **Name**: discord-rpc-panel
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

4. **Crie o serviço**
   - Clique em "Create Web Service"
   - Aguarde o deploy (1-2 minutos)
   - Seu app estará em: `https://seu-app.onrender.com`

### ⚡ Manter ativo 24/7 (Free Tier)

O Render desliga apps após 15 minutos de inatividade:

1. Acesse: https://uptimerobot.com/
2. Cadastre-se gratuitamente
3. Adicione um monitor HTTP(s):
   - **URL**: `https://seu-app.onrender.com`
   - **Interval**: 5 minutos
4. Pronto! Seu app ficará sempre ativo

## 🔧 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/22ez0/discord-rich-presence.git
cd discord-rich-presence

# Instale as dependências
npm install

# Execute
npm start
```

Acesse: http://localhost:5000

## 🛠️ Tecnologias

- Node.js + Express
- Discord.js-selfbot-v13
- Discord.js
- HTML5 + CSS3 + Vanilla JavaScript

## 📝 Estrutura do Projeto

```
.
├── server.js              # Servidor Express + Discord
├── package.json           # Dependências
├── README.md             # Documentação
└── public/
    ├── index.html        # Interface web
    ├── style.css         # Estilo
    └── script.js         # Interatividade
```

## ⚠️ Aviso Legal

Esta aplicação utiliza selfbot (automação de conta de usuário), o que pode violar os Termos de Serviço do Discord. Use por sua conta e risco.

## 📄 Licença

ISC

---

Feito com ❤️ para a comunidade Discord

**Autor**: yz

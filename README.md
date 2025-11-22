# Discord Rich Presence Panel - lol

Um painel web para ativar Discord Rich Presence no seu computador!

## ⚠️ IMPORTANTE

Esta aplicação **deve ser executada no seu computador**, não em servidores. Discord RPC só funciona localmente.

## Como usar

### 1️⃣ Instalar Node.js
https://nodejs.org/

### 2️⃣ Clonar o projeto
```bash
git clone https://github.com/22ez0/discord-rich-presence.git
cd discord-rich-presence
```

### 3️⃣ Instalar dependências
```bash
npm install
```

### 4️⃣ Executar
```bash
npm start
```

Abra: http://localhost:5000

### 5️⃣ Ativar

Clique no botão "Ativar Rich Presence" quando:
- ✅ Discord está aberto no seu PC
- ✅ Você está online (não em offline mode)

## Rich Presence Configurado

```
Título:     lol
Subtítulo:  by yz
Status:     assistindo gore
Botão:      clica aíkk → https://guns.lol/vgss
```

## Parar
Clique em "Desativar" ou fecha o terminal (Ctrl+C).

## Estrutura
```
discord-rich-presence/
├── server.js          (backend)
├── package.json       (dependências)
├── public/
│   ├── index.html    (painel)
│   ├── style.css     (estilo)
│   └── script.js     (interatividade)
└── README.md         (documentação)
```

## Tecnologias
- Node.js + Express
- Discord RPC
- HTML5 + CSS3 + Vanilla JS

## Autor
yz

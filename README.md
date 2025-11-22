# Discord Rich Presence Panel - lol

Um cliente local para ativar Discord Rich Presence com um clique!

## ⚠️ IMPORTANTE

**Esta aplicação deve ser executada NO SEU COMPUTADOR**, não em servidores. O Discord RPC funciona apenas localmente via IPC.

## Como usar

### 1️⃣ Instalar Node.js

Baixe em: https://nodejs.org/

### 2️⃣ Clonar ou Baixar o Projeto

```bash
git clone https://github.com/22ez0/discord-rich-presence.git
cd discord-rich-presence
```

### 3️⃣ Instalar Dependências

```bash
npm install
```

### 4️⃣ Executar

```bash
npm start
```

### 5️⃣ Pronto!

O painel aparecerá no terminal. Certifique-se que:
- ✅ Discord está aberto
- ✅ Você está online (não em offline mode)
- ✅ Node.js está instalado

## Rich Presence Configurado

```
Título:     lol
Subtítulo:  by yz
Status:     assistindo gore
Botão:      clica aíkk → https://guns.lol/vgss
```

## Parar

Digite `sair` no terminal e pressione Enter.

## Estrutura

```
discord-rich-presence/
├── server.js          (aplicação principal)
├── package.json       (dependências)
└── README.md         (esta documentação)
```

## Tecnologias

- Node.js
- Discord RPC v4
- CLI interativa

## Autor

yz

## License

ISC

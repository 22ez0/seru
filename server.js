const RPC = require('discord-rpc');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = '1199850289652691025'; // ID da aplicação Discord

let rpcClient = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupRPC() {
  try {
    console.log('\n🎮 Conectando ao Discord...\n');

    rpcClient = new RPC.Client({ transport: 'ipc' });

    await rpcClient.connect(CLIENT_ID);
    console.log('✓ Conectado ao Discord!\n');

    // Set rich presence
    await rpcClient.setActivity({
      details: 'lol',
      state: 'assistindo gore',
      largeImageKey: 'serufofa',
      largeImageText: 'lol',
      smallImageKey: 'serufofa',
      smallImageText: 'by yz',
      buttons: [
        {
          label: 'clica aíkk',
          url: 'https://guns.lol/vgss'
        }
      ],
      startTimestamp: Date.now(),
      instance: true
    });

    console.log('✓ Rich Presence ATIVADO COM SUCESSO!\n');
    console.log('📊 Status no Discord:');
    console.log('   Título: lol');
    console.log('   Subtítulo: by yz');
    console.log('   Status: assistindo gore');
    console.log('   Botão: clica aíkk → https://guns.lol/vgss\n');
    console.log('Digite "sair" para desativar e sair do programa.\n');

  } catch (error) {
    console.error('\n❌ ERRO ao conectar:', error.message);
    console.log('\n⚠️  Certifique-se que:');
    console.log('   1. Discord está aberto no seu computador');
    console.log('   2. Você não está em modo offline\n');
    process.exit(1);
  }
}

function askCommand() {
  rl.question('> ', async (input) => {
    if (input.toLowerCase() === 'sair') {
      console.log('\nDesativando Rich Presence...');
      if (rpcClient) {
        await rpcClient.destroy();
      }
      console.log('✓ Desativado. Até logo!\n');
      process.exit(0);
    } else {
      console.log('Comando desconhecido. Digite "sair" para sair.\n');
      askCommand();
    }
  });
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Discord Rich Presence Panel - lol   ║');
  console.log('║              by yz                    ║');
  console.log('╚════════════════════════════════════════╝\n');

  await setupRPC();
  askCommand();
}

main().catch(console.error);

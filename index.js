const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

// Configuração do Servidor Express (Para o Render não derrubar o bot)
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Logística Zema (Baileys) Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

// Função principal do Bot
async function connectToWhatsApp() {
    // Essa pasta vai guardar o login para não pedir QR code toda hora (se persistida)
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Desligamos o padrão para usar o nosso menor e mais legível
    });

    // Salva as credenciais sempre que houver atualização
    sock.ev.on('creds.update', saveCreds);

    // Monitora a conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n--- LEIA O QR CODE ABAIXO ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão caiu. Reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot conectado com sucesso no WhatsApp Business!');
        }
    });

    // Monitora as mensagens que chegam
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // Barreira: Ignora mensagens enviadas pelo próprio bot ou status do WhatsApp
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        // O Baileys entrega o texto em locais diferentes dependendo se tem link/emoji
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // Regra de Negócio: Verifica se a mensagem contém "lacrado"
        if (texto.toLowerCase().includes('lacrado')) {
            console.log('\n--- MENSAGEM VALIDA RECEBIDA ---');
            console.log('De:', msg.key.remoteJid);
            console.log('Texto:', texto);
            
            try {
                // AQUI ENTRA A SUA INTEGRAÇÃO ZEMA
                // await axios.post('SUA_API_AQUI', ...);
                
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ Processando seu lacrado no sistema Zema...' });
            } catch (err) {
                console.error('Erro na integração:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Erro de comunicação com o sistema.' });
            }
        }
    });
}

// Inicia o bot
connectToWhatsApp();

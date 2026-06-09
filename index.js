const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Logística Zema (Baileys) Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['Mac OS', 'Chrome', '121.0.0'], 
        syncFullHistory: false, // EVITA TIMEOUT DE HISTÓRICO
        markOnlineOnConnect: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n--- LEIA O QR CODE ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(connectToWhatsApp, 2000);
            else connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ Bot Conectado com sucesso!');
        }
    });

    // Filtro de mensagens garantido dentro do escopo do "sock"
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        // IDs configurados
        const ID_DO_GRUPO = '120363425613612495@g.us'; 
        const MEU_NUMERO = process.env.MEU_NUMERO_WHATSAPP; 

        const chatDeOrigem = msg.key.remoteJid;
        let quemEnviou = msg.key.participant || msg.key.remoteJid;
        
        // Corrige se a mensagem foi enviada pelo próprio bot
        if (msg.key.fromMe) {
            quemEnviou = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        }

        // Filtro Blindado
        if (chatDeOrigem !== ID_DO_GRUPO || quemEnviou !== MEU_NUMERO) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (texto.toLowerCase().includes('lacrado')) {
            console.log('\n--- COMANDO AUTORIZADO RECEBIDO ---');
            try {
                await sock.sendMessage(chatDeOrigem, { text: '✅ Processando seu lacrado no sistema Zema...' }, { quoted: msg });
            } catch (err) {
                console.error('Erro:', err);
            }
        }
    });
}

connectToWhatsApp();

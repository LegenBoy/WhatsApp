const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs'); // Adicionado para gerenciar pastas

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Logística Zema (Baileys) Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        // 1. O DISFARCE: Finge ser um Mac rodando Chrome para evitar bloqueios da Meta
        browser: ['Mac OS', 'Chrome', '121.0.0'], 
        // 2. ECONOMIA DE MEMÓRIA: Não baixa o histórico antigo de mensagens
        syncFullHistory: false 
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n--- LEIA O QR CODE ABAIXO ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log('Conexão caiu. Status:', statusCode);
            
            // Se foi desconectado forçadamente, limpa a sessão corrompida para gerar um QR Code novo
            if (!shouldReconnect) {
                console.log('Sessão inválida. Limpando dados antigos...');
                fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
            }

            if (shouldReconnect) {
                // Pequeno atraso para não causar loop infinito instantâneo
                setTimeout(connectToWhatsApp, 2000);
            } else {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot conectado com sucesso no WhatsApp Business!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (texto.toLowerCase().includes('lacrado')) {
            console.log('\n--- MENSAGEM VALIDA RECEBIDA ---');
            console.log('De:', msg.key.remoteJid);
            console.log('Texto:', texto);
            
            try {
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ Processando seu lacrado no sistema Zema...' });
            } catch (err) {
                console.error('Erro na integração:', err);
            }
        }
    });
}

connectToWhatsApp();

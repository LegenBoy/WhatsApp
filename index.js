const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Logística Zema (Baileys) Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

async function connectToWhatsApp() {
    // Busca a versão mais recente exigida pelo WhatsApp hoje
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando a versão do WhatsApp Web v${version.join('.')} (Mais recente: ${isLatest})`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        version, // Injeta a versão correta para evitar o erro 405
        auth: state,
        printQRInTerminal: false,
        browser: ['Mac OS', 'Chrome', '121.0.0'], 
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
            
            if (!shouldReconnect || statusCode === 405) {
                console.log('Sessão inválida ou versão rejeitada. Limpando dados antigos...');
                fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
            }

            if (shouldReconnect) {
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
        
        // 1. Ignora mensagens vazias, status ou mensagens do próprio bot
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        // =========================================================
        // 2. CONFIGURE SEUS IDs AQUI (Atenção ao @s.whatsapp.net)
        // =========================================================
        const ID_DO_GRUPO = '1234567890-123456@g.us'; // Substitua pelo ID do seu grupo
        const MEU_NUMERO = '5534XXXXXXXXX@s.whatsapp.net'; // Substitua pelo seu número

        const chatDeOrigem = msg.key.remoteJid;
        // Em grupos, o remetente fica em "participant". Em chat privado, fica em "remoteJid".
        const quemEnviou = msg.key.participant || msg.key.remoteJid;
    
        console.log('Grupo ID:', chatDeOrigem, '| Quem mandou:', quemEnviou);

        // 3. O GRANDE FILTRO: É do grupo certo E foi você quem mandou?
        if (chatDeOrigem !== ID_DO_GRUPO || quemEnviou !== MEU_NUMERO) {
            return; // Se não for, ignora e o log fica limpo!
        }

        // 4. Se chegou até aqui, é você falando no grupo certo!
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (texto.toLowerCase().includes('lacrado')) {
            console.log('\n--- COMANDO AUTORIZADO RECEBIDO ---');
            console.log('Texto:', texto);
            
            try {
                // AQUI VAI O SEU AXIOS PARA A API DA ZEMA
                // await axios.post(...)

                // Responde marcando a sua mensagem no grupo
                await sock.sendMessage(chatDeOrigem, { text: '✅ Atualizando baú lacrado no sistema Zema...' }, { quoted: msg });
            } catch (err) {
                console.error('Erro na integração:', err);
                await sock.sendMessage(chatDeOrigem, { text: '❌ Erro de comunicação com o sistema.' });
            }
        }
    });
}

connectToWhatsApp();

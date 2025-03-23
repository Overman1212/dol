const express = require('express');
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Telegraf } = require('telegraf');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Solana Testnet connection
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

// Replace with your private key for the faucet wallet
const senderWallet = Keypair.fromSecretKey(new Uint8Array([/* your private key array */]));

// Telegram bot setup
const bot = new Telegraf('YOUR_BOT_API_KEY'); // Replace with your Telegram bot API key

app.use(express.json());

// Endpoint to request Solana faucet coins
app.post('/send-solana', async (req, res) => {
  const { to, amount } = req.body;
  if (!to || !amount) {
    return res.status(400).send({ error: 'Missing "to" or "amount" in request' });
  }

  try {
    const recipientPublicKey = new web3.PublicKey(to);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderWallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL, // Amount in lamports
      })
    );

    const signature = await connection.sendTransaction(transaction, [senderWallet]);
    await connection.confirmTransaction(signature);

    res.status(200).send({ success: true, transactionSignature: signature });
  } catch (error) {
    console.error('Error sending Solana:', error);
    res.status(500).send({ error: 'Failed to send Solana' });
  }
});

bot.command('faucet', async (ctx) => {
  const text = 'Please send me your Solana Testnet address and the amount of SOL you want (e.g., /request <address> <amount>).';
  ctx.reply(text);
});

bot.command('request', async (ctx) => {
  const [_, address, amount] = ctx.message.text.split(' ');
  if (!address || !amount) {
    return ctx.reply('Invalid command. Usage: /request <address> <amount>');
  }

  try {
    const response = await axios.post('https://your-vercel-api-url.vercel.app/send-solana', {
      to: address,
      amount: parseFloat(amount),
    });

    if (response.data.success) {
      ctx.reply(`Sent ${amount} SOL to ${address}. Transaction signature: ${response.data.transactionSignature}`);
    } else {
      ctx.reply('Failed to send SOL.');
    }
  } catch (error) {
    ctx.reply('Something went wrong while processing your request.');
  }
});

bot.launch();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

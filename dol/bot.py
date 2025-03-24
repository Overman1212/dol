import os
from telegram import Update
from telegram.ext import Application, CommandHandler

# Replace 'YOUR_BOT_API_KEY' with your actual Telegram Bot API key
TOKEN = os.getenv("BOT_TOKEN")

async def start(update: Update, context):
    """Send a welcome message when the /start command is issued."""
    await update.message.reply_text("Welcome to the bot! How can I help you today?")

def main():
    """Start the bot and set up the /start command handler."""
    # Create an application instance
    application = Application.builder().token(TOKEN).build()

    # Add command handler
    start_handler = CommandHandler("start", start)
    application.add_handler(start_handler)

    # Run the bot
    application.run_polling()

# Entry point for Vercel (Serverless function)
if __name__ == "__main__":
    main()

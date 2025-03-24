import requests
from flask import Flask, request, jsonify

TOKEN = "7776256500:AAFwwAfkFGHR6-Fs5MYcHHkq9IjnAc24iHM"  # Replace with your bot token
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"

app = Flask(__name__)

def get_profile_photo(user_id):
    """Fetches the user's profile photo URL"""
    response = requests.get(f"{BASE_URL}/getUserProfilePhotos", params={"user_id": user_id, "limit": 1})
    data = response.json()
    
    if data.get("ok") and data["result"]["total_count"] > 0:
        file_id = data["result"]["photos"][0][0]["file_id"]
        file_info = requests.get(f"{BASE_URL}/getFile", params={"file_id": file_id}).json()
        file_path = file_info["result"]["file_path"]
        return f"https://api.telegram.org/file/bot{TOKEN}/{file_path}"
    
    return None  # No profile picture

@app.route("/get_user_photo", methods=["POST"])
def get_user_photo():
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "No user_id provided"}), 400

    photo_url = get_profile_photo(user_id)
    return jsonify({"photo_url": photo_url or "default_avatar.png"})  # Use default if no profile photo

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask
import os

# create the app
app = Flask(__name__)

# route: defines what happens when user goes to "/"
@app.route("/")
def home():
    return "BROOOOO 🚀🔥 Your first Python backend is alive!"

@app.route("/about")
def about():
    return "This is Yorik’s Crazy Project Vault 💀⚡"

@app.route("/html")
def html_page():
    return """
    <h1>🔥 WELCOME BRO 🔥</h1>
    <p>This is your custom page!</p>
    """

@app.route("/user/<name>")
def greet(name):
    return f"Yo {name} 😎🔥 Welcome to the Vault!"



# run the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)


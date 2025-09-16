from flask import Flask, render_template
import os

app = Flask(__name__)

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

@app.route("/testing/html")
def file_browser():
    return render_template("filebrowser.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

from flask import Flask, jsonify, render_template, request
import os

app = Flask(__name__)

BASE_DIR = "projects"  # 👈 point this to your projects folder

def get_folder_structure(path):
    data = {}
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        # only take folders (skip files with '.')
        if os.path.isdir(item_path):
            # check inside for subfolders
            subfolders = [
                sub for sub in os.listdir(item_path)
                if os.path.isdir(os.path.join(item_path, sub))
            ]
            data[item] = subfolders
    return data

@app.route("/api/files")
def get_files():
    path = request.args.get("path", "")
    abs_path = os.path.join(BASE_DIR, path)

    if not os.path.exists(abs_path):
        return jsonify([])

    files = []
    for item in os.listdir(abs_path):
        full = os.path.join(abs_path, item)
        if os.path.isfile(full):
            files.append({
                "name": item,
                "type": os.path.splitext(item)[1][1:],  # extension w/o dot
                "size": f"{os.path.getsize(full)//1024} KB"
            })
    return jsonify(files)

@app.route("/testing/html")
def send_folder_structure():
    structure = get_folder_structure(BASE_DIR)
    return jsonify(structure)  # 👈 frontend can fetch this


@app.route("/")
def index():
    return render_template("index.html")



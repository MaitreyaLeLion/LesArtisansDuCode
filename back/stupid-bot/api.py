import json
import sqlite3
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import euclidean_distances

app = Flask(__name__)
CORS(app)

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def blob_to_vector(blob):
    """Convertit un BLOB SQLite en numpy array"""
    return np.frombuffer(blob, dtype=np.float32)

def find_answer_in_json(question, json_file="data.json"):
    """Retourne la réponse associée à la question dans data.json"""
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for entry in data:
        if question in entry["user_questions"]:
            idx = entry["user_questions"].index(question)
            return entry["possible_answers"][idx]
    return "Aucune réponse trouvée."

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    message = data["message"]

    # Encoder le message reçu
    input_vector = model.encode([message])  # shape (1, dim)

    # Connexion à la DB
    conn = sqlite3.connect("../express-ts/database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT sentence, vector FROM embeddings")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"error": "No embeddings in DB"}), 404

    # Récupérer toutes les phrases et vecteurs
    sentences = []
    vectors = []
    for sentence, blob_vector in rows:
        sentences.append(sentence)
        vectors.append(blob_to_vector(blob_vector))

    vectors = np.stack(vectors)  # shape (n_samples, dim)

    # Calculer toutes les distances euclidiennes
    distances = euclidean_distances(input_vector, vectors)  # shape (1, n_samples)

    # Trouver l'indice de la distance maximale
    max_idx = np.argmax(distances[0])
    max_distance = float(distances[0][max_idx])
    max_sentence = sentences[max_idx]
    answer = find_answer_in_json(max_sentence)

    return jsonify({
        "response": answer,
        "distance": max_distance
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3002, debug=True)

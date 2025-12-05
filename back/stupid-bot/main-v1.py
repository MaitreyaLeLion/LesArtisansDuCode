from sentence_transformers import SentenceTransformer
import json

import sqlite3
import numpy as np

# ======DATABASE SETUP======
conn = sqlite3.connect("../express-ts/database.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS embeddings (
    sentence TEXT,
    vector BLOB
)
""")


# =====GETTING ALL QUESTIONS====
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

all_questions = []

for item in data:
    all_questions.extend(item["user_questions"])

# print(all_questions)


# ======GETTING VETORS=======
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
embeddings = model.encode(all_questions)
# print(embeddings)


#======INSERT INTO DB=======
for i in range(len(embeddings)):
    vector_blob = embeddings[i].tobytes()
    cursor.execute(
    "INSERT INTO embeddings (sentence, vector) VALUES (?, ?)",
    (all_questions[i], vector_blob)
)
    
# ======LOADING A VECTOR======

cursor.execute("SELECT vector FROM embeddings WHERE rowid=1")
vector_blob = cursor.fetchone()[0]
embedding = np.frombuffer(vector_blob, dtype=np.float32)

print(embedding)
    
conn.commit()
conn.close()
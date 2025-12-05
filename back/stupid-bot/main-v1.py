import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "distilgpt2"  # petit, rapide, local
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def stupid_reply(prompt):
    # On encode le prompt
    inputs = tokenizer(prompt, return_tensors="pt")

    # On génère une phrase volontairement absurde
    output = model.generate(
        **inputs,
        max_length=40,
        do_sample=True,
        temperature=2.0,   # très chaotique
        top_k=3,           # très restrictif -> casse le sens
        repetition_penalty=0.1,  # favorise l'absurde
    )

    text = tokenizer.decode(output[0], skip_special_tokens=True)

    # On enlève la partie du prompt pour ne garder QUE la réponse
    return text[len(prompt):].strip()

print("Chatbot stupide (GPT-2 saboté)")
while True:
    msg = input("> ")
    if msg.lower() in ["quit", "exit"]:
        break
    print(stupid_reply(msg))

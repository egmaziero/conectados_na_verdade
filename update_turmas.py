import json
import re

labels = [
    "ING_11_SEG_A_QUI_MAR",
    "ING_16_SEG_A_QUI_KAR",
    "ING_10_30_SEG_A_QUI_MAR",
    "ING_13_30_SEG_A_QUI_TAN",
    "ING_14_00_SEG_A_QUI_TAN",
    "ING_14_30_SEG_A_QUI_TAN",
    "ING_08_SEG_A_QUI_MAR",
    "ING_15_30_SEG_A_QUI_KAR",
    "ING_16_30_SEG_A_QUI_KAR",
    "ING_17_SEG_A_QUI_KAR",
    "ING_07_30_SEG_A_QUI_MAR",
    "ING_20_QUI_ROG",
    "ING_20_30_QUA_ROG",
    "ING_16_SEG_LUI",
    "ING_20_TER_LUI"
]

html_path = 'turmas/turmas-ingles.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace data-href with the new ones
new_html = html
for label in labels:
    # Find the next tr data-href
    new_html = re.sub(r'data-href="[^"]+"', f'data-href="../professor-turma.html?turma={label}"', new_html, count=1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Updated HTML.")

# Generate JSON array for turmas
json_path = 'assets/data/site-data.example.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

turmas_data = []

# Hardcoded for now based on the image/table logic
turmas_info = [
    (labels[0], 4, 6, "iniciante", "11:00", [1,2,3,4], 30, "mariana-lacerda", 10000),
    (labels[1], 4, 6, "iniciante", "16:00", [1,2,3,4], 30, "karine-guillem", 10000),
    (labels[2], 6, 8, "iniciante", "10:30", [1,2,3,4], 30, "mariana-lacerda", 10000),
    (labels[3], 8, 10, "iniciante", "13:30", [1,2,3,4], 30, "tania-guillem", 10000),
    (labels[4], 8, 10, "iniciante", "14:00", [1,2,3,4], 30, "tania-guillem", 10000),
    (labels[5], 8, 10, "iniciante", "14:30", [1,2,3,4], 30, "tania-guillem", 10000),
    (labels[6], 8, 12, "básico", "08:00", [1,2,3,4], 30, "mariana-lacerda", 10000),
    (labels[7], 10, 14, "básico com gramática", "15:30", [1,2,3,4], 30, "karine-guillem", 10000),
    (labels[8], 10, 14, "básico com gramática", "16:30", [1,2,3,4], 30, "karine-guillem", 10000),
    (labels[9], 7, 10, "iniciante", "17:00", [1,2,3,4], 30, "karine-guillem", 10000),
    (labels[10], None, None, "médio com gramática", "07:30", [1,2,3,4], 30, "mariana-lacerda", 10000),
    (labels[11], None, None, "iniciante", "20:00", [4], 90, "rogerio-muniz", 5000),
    (labels[12], None, None, "iniciante", "20:30", [3], 90, "rogerio-muniz", 5000),
    (labels[13], None, None, "quase conversação", "16:00", [1], 60, "luisa-dresch", 5000),
    (labels[14], None, None, "conversação avançada", "20:00", [2], 60, "luisa-dresch", 5000)
]

for i, t in enumerate(turmas_info):
    label, idMin, idMax, nivel, hora, dias, dur, prof, preco = t
    
    pub = {"nivel": nivel}
    if idMin: pub["idadeMin"] = idMin
    if idMax: pub["idadeMax"] = idMax
    if not idMin: pub["rotulo"] = "Adolescentes e Adultos" if label != labels[13] else "Misto"
    
    turmas_data.append({
        "id": label,
        "ofertaId": "ingles",
        "publico": pub,
        "horaInicio": hora,
        "dias": dias,
        "duracaoMinutos": dur,
        "professorId": prof,
        "precoCentavos": preco,
        "ativo": True,
        "ordem": (i+1)*10,
        "audioEpecificoUrl": f"assets/audio/turmas/{label}.mp3",
        "materialId": "infantil" if (idMax and idMax <= 10) else "material-teens"
    })

data['turmas'] = turmas_data

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated JSON.")

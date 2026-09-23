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

def replace_func(match):
    global idx
    label = labels[idx]
    idx += 1
    return f'data-href="../professor-turma.html?turma={label}"'

idx = 0
new_html = re.sub(r'data-href="[^"]+"', replace_func, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)


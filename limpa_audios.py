import os

import json

dir_path = "./sounds/"

# listar arquivos
arquivos = os.listdir(dir_path)

""" for arquivo in arquivos:
    if os.path.isfile(os.path.join(dir_path, arquivo)):
        print(arquivo) """

# verificar arquivos não utilizados
# Caminho do arquivo JSON
file_path = './categories.json'

# Abrir e ler o arquivo JSON
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Exibir os dados carregados
not_delet = []
for c in data:
    for sc in c["detalhes"]['sub_categoria']:
        for a in sc["audios"]:
            not_delet.append(f'{a['NOME_AUDIO']}.mp3')


# deletar arquivos
for file in arquivos:
    file_path = os.path.join(dir_path, file)
    if os.path.isfile(file_path):
        if file not in not_delet:
            os.remove(file_path)
            #print(file)

print(arquivos)
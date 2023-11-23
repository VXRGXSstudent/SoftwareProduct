import requests
from flask import Flask, render_template, request, jsonify

# Inicialização do aplicativo Flask
app = Flask(__name__, template_folder='templates')

# Api armarzenada em uma variável
link = requests.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL')
link_dic = link.json()

# Rota para a página inicial
@app.route('/index')
def index():
    return render_template('home.html')

# Lista para armazenar itens do carrinho
carrinho = []

# Rota para adicionar itens ao carrinho via requisição POST
@app.route('/adicionar_carrinho', methods=['POST'])
def adicionar_carrinho():
    try:
        data = request.get_json()

        moeda = data.get('moeda')
        preco_reais = float(data.get('preco_reais'))
        quantidade = int(data.get('quantidade'))

        # Obter as taxas de câmbio uma vez para evitar inconsistências
        taxas_cambio = {
            'USD': cotacao_dolar_real(),
            'EUR': cotacao_euro_real(),
            'BTC': cotacao_bitcoin_real()
        }

        # Usar a função correspondente à moeda selecionada
        if moeda not in taxas_cambio:
            raise ValueError("Moeda não suportada")

        taxa_cambio = taxas_cambio[moeda]

        # Calcular o preço convertido
        preco_convertido = preco_reais / taxa_cambio

        # Adicionar item ao carrinho
        adicionar_item_carrinho(moeda, preco_convertido, quantidade)

        # Retorna as informações necessárias para o JavaScript
        return jsonify({
            'moeda': moeda,
            'preco_convertido': preco_convertido,
            'quantidade': quantidade,
            'taxas_cambio': taxas_cambio
        })

    except Exception as e:
        # Em caso de erro, retornar uma resposta com status 400 e uma mensagem de erro
        return jsonify({'error': str(e)}), 400

# Função para adicionar item ao carrinho
def adicionar_item_carrinho(moeda, preco_reais, quantidade):
    # Lógica para adicionar o item ao carrinho (pode ser armazenado em variáveis, banco de dados, etc.)

    # Exemplo simples: armazenar em um dicionário
    item_carrinho = {
        'moeda': moeda,
        'preco_reais': preco_reais,
        'quantidade': quantidade
    }

    carrinho.append(item_carrinho)

# Rota para obter taxas de câmbio
@app.route('/taxas_cambio', methods=['GET'])
def taxas_cambio():
    taxas = {
        'USD': cotacao_dolar_real(),
        'EUR': cotacao_euro_real(),
        'BTC': cotacao_bitcoin_real()
    }
    return jsonify(taxas)

# Função para obter a cotação do dólar em relação ao real
def cotacao_dolar_real():
    return float(link_dic['USDBRL']['bid'])

# Função para obter a cotação do euro em relação ao real
def cotacao_euro_real():
    return float(link_dic['EURBRL']['bid'])

# Função para obter a cotação do bitcoin em relação ao real
def cotacao_bitcoin_real():
    return float(link_dic['BTCBRL']['bid'])

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run()

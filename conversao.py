import requests
from flask import Flask, render_template, request, url_for

app = Flask(__name__, template_folder='templates')


@app.route('/adicionar_carrinho', methods=['GET', 'POST'])
def adicionar_carrinho():
    qtd = None
    preco = None
    if request.method == 'POST':
        preco = float(request.form['preco'])
        qtd = int(request.form.get('quantidade'))

    return render_template('home.html', preco=preco, qtd=qtd)


@app.route('/conversao', methods=['GET', 'POST'])
def index():
    valor_convertido = None
    moeda = None

    if request.method == 'POST':
        valor = float(request.form['valor'])
        moeda_origem = request.form['moeda_origem'].upper()
        valor_convertido, moeda = converter_para_real(valor, moeda_origem)

    return render_template('site.html', valor_convertido=valor_convertido, moeda=moeda)

link = requests.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL')
link_dic = link.json()

def cotacao_dolar_real():
    return float(link_dic['USDBRL']['bid'])

def cotacao_euro_real():
    return float(link_dic['EURBRL']['bid'])

def cotacao_bitcoin_real():
    return float(link_dic['BTCBRL']['bid'])

def converter_para_real(valor, moeda_origem):
    if moeda_origem == 'USD':
        cotacao = cotacao_dolar_real()
        moeda = 'USD'
    elif moeda_origem == 'EUR':
        cotacao = cotacao_euro_real()
        moeda = 'EUR'
    elif moeda_origem == 'BTC':
        cotacao = cotacao_bitcoin_real()
        moeda = 'BTC'
    else:
        print("Moeda de origem não suportada.")
        return None, None
    valor_convertido = valor / cotacao
    return valor_convertido, moeda



if __name__ == '__main__':
    app.run()
 
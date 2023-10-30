document.addEventListener('DOMContentLoaded', function () {
    function atualizarPrecos() {
        const moedaSelecionada = document.getElementById("selectmoeda").value;
        const produtos = document.querySelectorAll(".produto");

        // Faça uma solicitação AJAX para obter as taxas de câmbio
        fetch('/taxas_cambio')
            .then(response => response.json())
            .then(data => {
                produtos.forEach(function (produto) {
                    const precoOriginal = parseFloat(produto.getAttribute('data-preco-original'));

                    if (!isNaN(precoOriginal)) {
                        const novoPreco = converterMoeda(precoOriginal, moedaSelecionada, data);
                        produto.querySelector("h3").textContent = `${produto.querySelector("h3").textContent.split('-')[0]} - ${novoPreco} ${moedaSelecionada}`;
                    }
                });
            });
    }

    // A função de conversão de moeda aqui...
    function converterMoeda(precoOriginal, moeda, taxasCambio) {
        switch (moeda) {
            case 'USD':
                return (precoOriginal / taxasCambio.USD).toFixed(2);
            case 'EUR':
                return (precoOriginal / taxasCambio.EUR).toFixed(2);
            case 'BTC':
                return (precoOriginal / taxasCambio.BTC).toFixed(8);
            default:
                return precoOriginal.toFixed(2);
        }
    }

    // Essa parte garante que os preços sejam atualizados quando a página for carregada
    window.addEventListener("load", atualizarPrecos);

    // Manipulador de eventos para o elemento selectmoeda
    document.getElementById("selectmoeda").addEventListener("change", function () {
        atualizarPrecos();
    });
});

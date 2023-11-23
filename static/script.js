// Função para converter o preço original para a moeda selecionada com base nas taxas de câmbio
function converterMoeda(precoOriginal, moedaSelecionada, taxasCambio) {
    const taxaCambio = taxasCambio[moedaSelecionada];

    if (moedaSelecionada === "BRL") {
        return precoOriginal;
    } else {
        return precoOriginal / taxaCambio;
    }
}

// Função para abrir/fechar o carrinho e aplicar efeitos visuais
function abrirCarrinho(abrir) {
    const carrinhoSidebar = document.getElementById('carrinho-sidebar');
    carrinhoSidebar.style.display = abrir ? 'block' : 'none';
    desfocarFundo(abrir);
}

// Função para aplicar o efeito de desfoque no fundo ao abrir o carrinho
function desfocarFundo(destacar) {
    const principal = document.querySelector('.principal');
    principal.style.filter = destacar ? 'blur(5px)' : 'none';
}

// Função para atualizar dinamicamente o conteúdo do carrinho na barra lateral
function atualizarCarrinho(taxasCambio) {
    const carrinhoContainer = document.getElementById('carrinho-sidebar');
    const listaCarrinho = document.getElementById('carrinho-lista');

    listaCarrinho.innerHTML = '';
    let total = 0;

    carrinho.forEach((item) => {
        const itemLista = document.createElement('li');

        // Verifica se a taxa de câmbio para a moeda selecionada é diferente de zero
        if (taxasCambio[item.moeda] !== 0) {
            // Converte o preço para a moeda selecionada
            const precoConvertido = converterMoeda(item.precoReais, item.moeda, taxasCambio);

            // Exibe o item no formato desejado
            itemLista.textContent = `${item.quantidade} x ${precoConvertido.toFixed(2)} ${item.moeda}`;
            listaCarrinho.appendChild(itemLista);

            // Adiciona ao total convertendo para a moeda selecionada
            total += parseFloat(precoConvertido) * item.quantidade;
        } else {
            // Se a taxa de câmbio for zero, o preço não é convertido
            itemLista.textContent = `${item.quantidade} x ${item.precoReais} BRL`;
            listaCarrinho.appendChild(itemLista);
        }
    });

    const moedaSelecionada = document.getElementById("selectmoeda").value;
    const valorTotal = document.getElementById('valor-total');

    // Exibe o total convertido para a moeda selecionada
    valorTotal.textContent = `${total.toFixed(2)} ${moedaSelecionada}`;

    // Exibir o container do carrinho apenas se houver itens no carrinho
    carrinhoContainer.style.display = carrinho.length > 0 ? 'block' : 'none';
}

// Função assíncrona para adicionar um item ao carrinho via requisição POST
async function adicionarAoCarrinho(event, produtoId) {
    event.preventDefault();

    const moedaSelecionada = document.getElementById('selectmoeda').value;
    const quantidade = parseInt(document.getElementById(`quantidade${produtoId}`).value);
    const precoOriginal = parseFloat(document.querySelector(`.produto[data-produto-id="${produtoId}"]`).getAttribute('data-preco-original'));

    try {
        // Obtém as taxas de câmbio
        const response = await fetch('/taxas_cambio');
        const taxasCambio = await response.json();

        // Converte o preço para a moeda selecionada
        const precoConvertido = converterMoeda(precoOriginal, moedaSelecionada, taxasCambio);

        // Adiciona o item ao carrinho
        if (!isNaN(precoConvertido)) {
            carrinho.push({
                moeda: moedaSelecionada,
                precoReais: precoOriginal,  // Use o preço original aqui
                precoConvertido: precoConvertido,
                quantidade: quantidade
            });

            // Atualiza a exibição do carrinho
            atualizarCarrinho(taxasCambio);
            desfocarFundo(true);
        } else {
            alert('A taxa de câmbio para a moeda selecionada é zero. O item não foi adicionado ao carrinho.');
        }
    } catch (error) {
        console.error('Erro ao obter taxas de câmbio:', error);
    }
}

// Função para limpar o carrinho
function limparCarrinho() {
    carrinho.length = 0; // Limpa a lista de itens do carrinho
    atualizarCarrinho(taxasCambio); // Atualiza a exibição do carrinho
    desfocarFundo(false)
}

// Array para armazenar itens do carrinho
const carrinho = [];

// Objeto para armazenar as taxas de câmbio
let taxasCambio = null;

// Função executada quando o DOM está totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    // Função para atualizar os preços dos produtos na moeda selecionada
    function atualizarPrecos() {
        const moedaSelecionada = document.getElementById("selectmoeda").value;
        const produtos = document.querySelectorAll(".produto");

        fetch('/taxas_cambio').then(response => response.json()).then(data => {
            taxasCambio = data;

            produtos.forEach(function (produto) {
                const precoOriginal = parseFloat(produto.getAttribute("data-preco-original"));

                if (precoOriginal !== 0) {
                    const taxaCambio = taxasCambio[moedaSelecionada];

                    if (taxaCambio !== 0) {
                        const precoConvertido = converterMoeda(precoOriginal, moedaSelecionada, taxasCambio);
                        produto.querySelector("h3").textContent = `${produto.querySelector("h3").textContent.split("-")[0]} - ${precoConvertido.toFixed(2)} ${moedaSelecionada}`;
                    } else {
                        produto.querySelector("h3").textContent = `${produto.querySelector("h3").textContent.split("-")[0]} - ${precoOriginal} BRL`;
                    }
                }
            });
        });
    }

    // Event listener para atualizar os preços ao alterar a moeda no seletor
    document.getElementById("selectmoeda").addEventListener("change", function () {
        atualizarPrecos();
    });

    // Event listener para adicionar itens ao carrinho ao enviar o formulário
    const produtos = document.querySelectorAll('.produto form');

    produtos.forEach((produtoForm) => {
        produtoForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const produtoId = parseInt(this.closest('.produto').getAttribute('data-produto-id'));
            adicionarAoCarrinho(event, produtoId);
        });
    });

    // Adiciona um event listener para fechar o carrinho ao clicar no fundo desfocado
    const principal = document.querySelector('.principal');
    principal.addEventListener('click', function (event) {
        const carrinhoSidebar = document.getElementById('carrinho-sidebar');
        if (carrinhoSidebar.style.display === 'block') {
            abrirCarrinho(false); // Feche o carrinho se estiver aberto
        }
    });

     // Adiciona um event listener para o botão "Clear Cart"
     document.getElementById('limpar-carrinho').addEventListener('click', limparCarrinho);
});

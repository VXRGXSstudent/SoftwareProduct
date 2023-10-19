document.addEventListener('DOMContentLoaded', function() {
    const openButtons = document.querySelectorAll('[id^="open_converter_"]');
    const converterPopup = document.getElementById('converter-popup');
    const valorInput = document.getElementById('valor');
    openButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            console.log('Botão clicado:', button); // Adicione esta linha para depuração
            const precoString = button.getAttribute('data-preco');
            const preco = parseFloat(precoString.replace(',', '.'));
            console.log('Preço:', preco); // Adicione esta linha para depuração

            if (!isNaN(preco)) {
                valorInput.value = preco.toFixed(2);
                converterPopup.style.display = 'block';
            } else {
                alert('Preço inválido para conversão.');
            }
        });
    });
});

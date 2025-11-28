function addItem() {
    const nameInput = document.getElementById('productName');
    const quantityInput = document.getElementById('productQuantity');
    const valueInput = document.getElementById('productValue');
    const listBody = document.getElementById('listBody');

    const name = nameInput.value;
    const quantity = parseInt(quantityInput.value);
    const value = parseFloat(valueInput.value);

    if (name && quantity > 0 && value > 0) {
        const subtotal = quantity * value;
        
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${name}</td>
            <td>${quantity}</td>
            <td>R$ ${value.toFixed(2)}</td>
            <td class="subtotal-cell">R$ ${subtotal.toFixed(2)}</td>
            <td class="actions-cell"><button class="edit-btn" onclick="editItem(this)">✏️</button>
            <button class="delete-btn" onclick="deleteItem(this, ${subtotal})">X</button></td>
        `;

        listBody.appendChild(newRow);
        updateTotal(subtotal);

        // Limpar campos de input
        nameInput.value = '';
        quantityInput.value = '1';
        valueInput.value = '';
        nameInput.focus();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

function deleteItem(button, subtotal) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal(-subtotal); // Subtrai o valor do item excluído do total
}

function updateTotal(amount) {
    const totalValueSpan = document.getElementById('totalValue');
    let currentTotal = parseFloat(totalValueSpan.textContent);
    currentTotal += amount;
    totalValueSpan.textContent = currentTotal.toFixed(2);
}

function editItem(button) {
    const row = button.closest('tr');
    const nameCell = row.cells[0];
    const quantityCell = row.cells[1];
    const valueCell = row.cells[2];

    const currentName = nameCell.textContent;
    const currentQuantity = parseInt(quantityCell.textContent);
    const currentValue = parseFloat(valueCell.textContent.replace('R$ ', ''));

    nameCell.innerHTML = `<input type="text" value="${currentName}">`;
    quantityCell.innerHTML = `<input type="number" value="${currentQuantity}" min="1">`;
    valueCell.innerHTML = `<input type="number" value="${currentValue.toFixed(2)}" min="0.01" step="0.01">`;

    button.textContent = '💾'; // Ícone de salvar
    button.onclick = function() { saveItem(this); };
}

function saveItem(button) {
    const row = button.closest('tr');
    const nameCell = row.cells[0];
    const quantityCell = row.cells[1];
    const valueCell = row.cells[2];
    const subtotalCell = row.cells[3];
    const actionsCell = row.cells[4];

    const nameInput = nameCell.querySelector('input');
    const quantityInput = quantityCell.querySelector('input');
    const valueInput = valueCell.querySelector('input');

    const newName = nameInput.value;
    const newQuantity = parseInt(quantityInput.value);
    const newValue = parseFloat(valueInput.value);

    if (newName && newQuantity > 0 && newValue > 0) {
        const oldSubtotalText = subtotalCell.textContent;
        const oldSubtotal = parseFloat(oldSubtotalText.replace('R$ ', ''));

        const newSubtotal = newQuantity * newValue;

        nameCell.textContent = newName;
        quantityCell.textContent = newQuantity;
        valueCell.textContent = `R$ ${newValue.toFixed(2)}`;
        subtotalCell.textContent = `R$ ${newSubtotal.toFixed(2)}`;

        const totalDifference = newSubtotal - oldSubtotal;
        updateTotal(totalDifference);

        const editBtn = actionsCell.querySelector('.edit-btn');
        editBtn.textContent = '✏️'; // Ícone de editar
        editBtn.onclick = function() { editItem(this); };

        const deleteBtn = actionsCell.querySelector('.delete-btn');
        deleteBtn.onclick = function() { deleteItem(this, newSubtotal); };
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

 async function shareOnWhatsApp() {
            const listBody = document.getElementById('listBody');
            const rows = listBody.getElementsByTagName('tr');
            const totalValue = document.getElementById('totalValue').innerText;

            if (rows.length === 0) {
                alert("A lista de compras está vazia!");
                return;
            }

            // 1. Criar o elemento HTML para o cupom
            const receipt = document.createElement('div');
            receipt.className = 'receipt-container';
            
            let receiptHTML = '<h3>🛒 CUPOM DE COMPRAS 🛒</h3>';
            receiptHTML += '<p>--------------------------------</p>';

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                const product = cells[0].innerText;
                const quantity = cells[1].innerText;
                const unitValue = cells[2].innerText;
                const subtotal = cells[3].innerText.replace('R$ ', '');

                receiptHTML += `<p><b>${product}</b></p>`;
                receiptHTML += `<p>${quantity} un x ${unitValue} = <b>R$ ${subtotal}</b></p>`;
                receiptHTML += '<p>--------------------------------</p>';
            }
            receiptHTML += `<p class="total">TOTAL: R$ ${totalValue}</p>`;
            receipt.innerHTML = receiptHTML;
            document.body.appendChild(receipt);
            receipt.style.display = 'block'; // Mostra para o html2canvas

            // 2. Gerar a imagem usando html2canvas
            try {
                const canvas = await html2canvas(receipt, { scale: 2 });
                receipt.style.display = 'none'; // Oculta novamente
                document.body.removeChild(receipt); // Remove da página

                canvas.toBlob(async (blob) => {
                    // 3. Tentar compartilhar a imagem usando a Web Share API
                    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'cupom.png', { type: 'image/png' })] })) {
                        await navigator.share({
                            files: [new File([blob], 'cupom.png', { type: 'image/png' })],
                            title: 'Minha Lista de Compras',
                            text: 'Aqui está minha lista de compras!',
                        });
                    } else {
                        // Fallback: se não puder compartilhar imagem, compartilha o texto
                        alert("Seu navegador não suporta o compartilhamento de imagens. Compartilhando como texto.");
                        shareAsTextFallback(rows, totalValue);
                    }
                }, 'image/png');
            } catch (error) {
                console.error('Erro ao gerar a imagem:', error);
                alert('Ocorreu um erro ao gerar a imagem do cupom. Compartilhando como texto.');
                shareAsTextFallback(rows, totalValue);
            }
        }

        function shareAsTextFallback(rows, totalValue) {
            let message = '🛒 *CUPOM DE COMPRAS* 🛒\n-----------------------------------\n';
            for (let i = 0; i < rows.length; i++) {
                const [product, quantity, unitValue, subtotal] = Array.from(rows[i].cells).map(cell => cell.innerText);
                message += `*${product}*\n${quantity} un x ${unitValue} = *${subtotal}*\n-----------------------------------\n`;
            }
            message += `*TOTAL: R$ ${totalValue}*`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }

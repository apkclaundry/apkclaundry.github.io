import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

function displayStocks() {
  const stockTableBody = document.querySelector('#stock-table tbody');
  const stockListContainer = document.querySelector('.stock-list');
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const isMobileView = window.innerWidth <= 768;

  stockTableBody.innerHTML = '';
  stockListContainer.innerHTML = '';

  stocks.forEach((stock) => {
    if (isMobileView) {
      // Mobile view: Display as a list
      const listItem = document.createElement('div');
      listItem.classList.add('stock-item');
      listItem.innerHTML = `
        <p><strong>ID:</strong> ${stock.id}</p>
        <p><strong>Nama:</strong> ${stock.name}</p>
        <p><strong>Stok:</strong> ${stock.stock}</p>
        <p><strong>Harga:</strong> ${formatRupiah(stock.price)}</p>
        <div class="actions">
          <button class="edit" onclick="editStock('${stock.id}')">&#9998;</button>
          <button class="delete" onclick="deleteStock('${stock.id}')">&#128465;</button>
        </div>
      `;
      stockListContainer.appendChild(listItem);
    } else {
      // Desktop view: Display as a table
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stock.id}</td>
        <td>${stock.name}</td>
        <td>${stock.stock}</td>
        <td>${formatRupiah(stock.price)}</td>
        <td class="actions">
          <button class="edit" onclick="editStock('${stock.id}')">&#9998;</button>
          <button class="delete" onclick="deleteStock('${stock.id}')">&#128465;</button>
        </td>
      `;
      stockTableBody.appendChild(row);
    }
  });

  // Show/hide elements based on view
  document.querySelector('#stock-table').style.display = isMobileView ? 'none' : 'table';
  stockListContainer.style.display = isMobileView ? 'block' : 'none';
}

function deleteStock(id) {
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  Swal.fire({
    title: 'Anda yakin?',
    text: "Data barang akan dihapus!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
  }).then((result) => {
    if (result.isConfirmed) {
      const updatedStocks = stocks.filter((stock) => stock.id !== id);
      localStorage.setItem('stocks', JSON.stringify(updatedStocks));
      displayStocks();
      Swal.fire('Dihapus!', 'Data barang telah dihapus.', 'success');
    }
  });
}

function editStock(id) {
  const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
  const stock = stocks.find((stock) => stock.id === id);

  Swal.fire({
    title: 'Edit Barang',
    html: `
      <input id="swal-input-id" class="swal2-input" placeholder="ID Barang" value="${stock.id}" disabled>
      <input id="swal-input-name" class="swal2-input" placeholder="Nama Barang" value="${stock.name}">
      <input id="swal-input-stock" class="swal2-input" placeholder="Jumlah Stok" type="number" value="${stock.stock}">
      <input id="swal-input-price" class="swal2-input" placeholder="Harga per Unit" type="number" value="${stock.price}">
    `,
    preConfirm: () => {
      const name = document.getElementById('swal-input-name').value.trim();
      const stockValue = parseInt(document.getElementById('swal-input-stock').value.trim());
      const price = parseFloat(document.getElementById('swal-input-price').value.trim());

      if (name && stockValue >= 0 && price >= 0) {
        stock.name = name;
        stock.stock = stockValue;
        stock.price = price;
        localStorage.setItem('stocks', JSON.stringify(stocks));
        displayStocks();
      } else {
        Swal.showValidationMessage('Mohon lengkapi data dengan benar!');
      }
    }
  });
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(number);
}

document.addEventListener('DOMContentLoaded', () => {
  const stockForm = document.getElementById('stock-form');

  stockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value.trim();
    const name = document.getElementById('item-name').value.trim();
    const stock = parseInt(document.getElementById('item-stock').value.trim());
    const price = parseFloat(document.getElementById('item-price').value.trim());

    if (!id || !name || stock < 0 || price < 0) {
      alert('Mohon lengkapi semua data dengan benar!');
      return;
    }

    const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
    stocks.push({ id, name, stock, price });
    localStorage.setItem('stocks', JSON.stringify(stocks));
    displayStocks();
    stockForm.reset();
  });

  displayStocks();
});

// Expose edit and delete functions globally
window.editStock = editStock;
window.deleteStock = deleteStock;

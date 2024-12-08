import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import {addCSS} from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Harga per kilogram berdasarkan jenis layanan
const servicePrices = {
  "cuci-setrika": 10000,
  "cuci": 6000,
  "setrika": 4000,
};

// Hitung total harga
document.getElementById('calculate-btn').addEventListener('click', function () {
  const serviceType = document.getElementById('service-type').value;
  const weightInput = document.getElementById('weight').value;
  const weight = parseFloat(weightInput);

  if (isNaN(weight) || weight <= 0) {
    Swal.fire('Error', 'Masukkan berat yang valid!', 'error');
    return;
  }

  // Ambil harga per kg berdasarkan jenis layanan
  const pricePerKg = servicePrices[serviceType];
  const totalPrice = Math.ceil(weight * pricePerKg);

  // Tampilkan total harga
  document.getElementById('total-price').value = `Rp${totalPrice.toLocaleString('id-ID')}`;
});

// Simpan data ke local storage
document.getElementById('save-btn').addEventListener('click', function () {
  const name = document.getElementById('customer-name').value;
  const phone = document.getElementById('customer-phone').value;
  const service = document.getElementById('service-type').value;
  const weight = document.getElementById('weight').value;
  const totalPrice = document.getElementById('total-price').value;

  if (!name || !phone || !service || !weight || !totalPrice) {
    Swal.fire('Error', 'Harap isi semua data sebelum menyimpan!', 'error');
    return;
  }

  const order = { name, phone, service, weight, totalPrice };

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Tampilkan data terbaru
  displayOrders();

  // Reset form
  document.getElementById('order-form').reset();
  document.getElementById('total-price').value = '';

  Swal.fire('Berhasil!', 'Pesanan berhasil disimpan.', 'success');
});

function displayOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const tableBody = document.querySelector('#order-table tbody');
  const orderList = document.querySelector('.order-list');

  tableBody.innerHTML = '';
  orderList.innerHTML = '';

  orders.forEach((order, index) => {
    // Tambahkan data ke tabel
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.name}</td>
      <td>${order.phone}</td>
      <td>${order.service}</td>
      <td>${order.weight}</td>
      <td>${order.totalPrice}</td>
      <td>
        <button class="edit" onclick="editOrder(${index})" title="Edit">
          <i class="fa fa-pencil-alt"></i>
        </button>
        <button class="delete" onclick="deleteOrder(${index})" title="Delete">
          <i class="fa fa-trash-alt"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);

    // Tambahkan data ke list
    const listItem = document.createElement('div');
    listItem.classList.add('order-item');
    listItem.innerHTML = `
      <p><strong>Nama Pelanggan:</strong> ${order.name}</p>
      <p><strong>Nomor Telepon:</strong> ${order.phone}</p>
      <p><strong>Jenis Layanan:</strong> ${order.service}</p>
      <p><strong>Berat (KG):</strong> ${order.weight}</p>
      <p><strong>Total Harga:</strong> ${order.totalPrice}</p>
      <div class="actions">
        <button class="edit" onclick="editOrder(${index})" title="Edit">
          <i class="fa fa-pencil-alt"></i>
        </button>
        <button class="delete" onclick="deleteOrder(${index})" title="Delete">
          <i class="fa fa-trash-alt"></i>
        </button>
      </div>
    `;
    orderList.appendChild(listItem);
  });
}


function editOrder(index) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders[index];

  Swal.fire({
    title: 'Edit Pesanan',
    html: `
      <label for="edit-name">Nama Pelanggan:</label>
      <input type="text" id="edit-name" class="swal2-input" value="${order.name}" required>
      <label for="edit-phone">Nomor Telepon:</label>
      <input type="tel" id="edit-phone" class="swal2-input" value="${order.phone}" required>
      <label for="edit-service">Jenis Layanan:</label>
      <select id="edit-service" class="swal2-select">
        <option value="cuci-setrika" ${order.service === 'cuci-setrika' ? 'selected' : ''}>Cuci & Setrika</option>
        <option value="cuci" ${order.service === 'cuci' ? 'selected' : ''}>Cuci</option>
        <option value="setrika" ${order.service === 'setrika' ? 'selected' : ''}>Setrika</option>
      </select>
      <label for="edit-weight">Berat (KG):</label>
      <input type="number" id="edit-weight" class="swal2-input" value="${order.weight}" required>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    preConfirm: () => {
      const updatedOrder = {
        name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        service: document.getElementById('edit-service').value,
        weight: document.getElementById('edit-weight').value,
        totalPrice: `Rp${Math.ceil(document.getElementById('edit-weight').value * servicePrices[document.getElementById('edit-service').value]).toLocaleString('id-ID')}`,
      };

      if (!updatedOrder.name || !updatedOrder.phone || !updatedOrder.service || !updatedOrder.weight) {
        Swal.showValidationMessage('Harap isi semua data!');
        return false;
      }

      return updatedOrder;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      orders[index] = result.value;
      localStorage.setItem('orders', JSON.stringify(orders));
      displayOrders();
      Swal.fire('Berhasil!', 'Pesanan berhasil diperbarui.', 'success');
    }
  });
}
window.editOrder = editOrder;

function deleteOrder(index) {
  Swal.fire({
    title: 'Hapus Pesanan?',
    text: "Data ini tidak dapat dipulihkan setelah dihapus!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.splice(index, 1);
      localStorage.setItem('orders', JSON.stringify(orders));
      displayOrders();
      Swal.fire('Dihapus!', 'Pesanan telah dihapus.', 'success');
    }
  });
}
window.deleteOrder = deleteOrder;


// Panggil fungsi untuk menampilkan data saat halaman dimuat
document.addEventListener('DOMContentLoaded', displayOrders);


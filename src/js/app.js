import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

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

  const pricePerKg = servicePrices[serviceType];
  const totalPrice = Math.ceil(weight * pricePerKg);

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

  // Tambahkan tanggal saat ini
  const date = new Date().toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const order = { 
    id: Date.now(),  // Menambahkan ID unik menggunakan timestamp
    name, 
    phone, 
    service, 
    weight, 
    totalPrice, 
    date, 
    isPaid: false 
  };

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  displayOrders();
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
    const paymentStatus = order.isPaid ? 'Paid' : 'Not Paid';
    const paymentColor = order.isPaid ? 'green' : 'red';

    const row = document.createElement('tr');
    row.dataset.index = index; // Simpan index sebagai data atribut
    row.innerHTML = `
      <td>${order.name}</td>
      <td>${order.phone}</td>
      <td>${order.service}</td>
      <td>${order.weight}</td>
      <td>${order.totalPrice}</td>
      <td>${order.date}</td>
      <td style="color: ${paymentColor}; font-weight: bold;">${paymentStatus}</td>
      <td>
        <button onclick="window.location.href='transaksi.html?id=${order.id}'">Payment</button>
        <button class="edit" title="Edit"><i class="fa fa-pencil-alt"></i></button>
        <button class="delete" title="Delete"><i class="fa fa-trash-alt"></i></button>
      </td>
    `;
    tableBody.appendChild(row);

    // Tambahkan data ke list versi mobile
    const listItem = document.createElement('div');
    listItem.classList.add('order-item');
    listItem.innerHTML = `
      <p><strong>Nama Pelanggan:</strong> ${order.name}</p>
      <p><strong>Nomor Telepon:</strong> ${order.phone}</p>
      <p><strong>Jenis Layanan:</strong> ${order.service}</p>
      <p><strong>Berat (KG):</strong> ${order.weight}</p>
      <p><strong>Total Harga:</strong> ${order.totalPrice}</p>
      <p><strong>Tanggal:</strong> ${order.date}</p>
      <p style="color: ${paymentColor}; font-weight: bold;" ><strong>Payment Status:</strong > ${paymentStatus}</p>
      <div class="actions">
        <button onclick="window.location.href='transaksi.html?id=${order.id}'">Payment</button>
        <button class="edit" onclick="editOrder(${index})">Edit</button>
        <button class="delete" onclick="deleteOrder(${index})">Delete</button>
      </div>
    `;
    orderList.appendChild(listItem);
  });
}

// Event delegation untuk tombol Payment, Edit, dan Delete
document.querySelector('#order-table tbody').addEventListener('click', function (event) {
  const target = event.target;
  const row = target.closest('tr');
  const index = parseInt(row.dataset.index, 10);

  if (target.classList.contains('payment')) {
    processPayment(index);
  } else if (target.classList.contains('edit') || target.closest('.edit')) {
    editOrder(index);
  } else if (target.classList.contains('delete') || target.closest('.delete')) {
    deleteOrder(index);
  }
});

function processPayment(index) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders[index].isPaid = true;
  localStorage.setItem('orders', JSON.stringify(orders));
  displayOrders();
  Swal.fire('Berhasil!', 'Pembayaran berhasil diproses.', 'success');
}

function editOrder(index) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders[index];

  // Menyiapkan konten form di dalam SweetAlert2 popup
  const content = `
    <label for="edit-name">Nama Pelanggan:</label>
    <input type="text" id="edit-name" class="swal2-input" value="${order.name}" required>

    <label for="edit-phone">Nomor Telepon:</label>
    <input type="text" id="edit-phone" class="swal2-input" value="${order.phone}" required>

    <label for="edit-service">Jenis Layanan:</label>
    <select id="edit-service" class="swal2-input" required>
      <option value="cuci-setrika" ${order.service === 'cuci-setrika' ? 'selected' : ''}>Cuci & Setrika</option>
      <option value="cuci" ${order.service === 'cuci' ? 'selected' : ''}>Cuci</option>
      <option value="setrika" ${order.service === 'setrika' ? 'selected' : ''}>Setrika</option>
    </select>

    <label for="edit-weight">Berat (KG):</label>
    <input type="number" id="edit-weight" class="swal2-input" value="${order.weight}" required>

    <label for="edit-total-price">Total Harga:</label>
    <input type="text" id="edit-total-price" class="swal2-input" value="${order.totalPrice}" readonly>
  `;

  // Menampilkan SweetAlert2 popup
  Swal.fire({
    title: 'Edit Pesanan',
    html: content,
    showCancelButton: true,
    confirmButtonText: 'Simpan Perubahan',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const updatedName = document.getElementById('edit-name').value;
      const updatedPhone = document.getElementById('edit-phone').value;
      const updatedService = document.getElementById('edit-service').value;
      const updatedWeight = parseFloat(document.getElementById('edit-weight').value);

      if (!updatedName || !updatedPhone || !updatedService || isNaN(updatedWeight) || updatedWeight <= 0) {
        Swal.showValidationMessage('Harap isi semua data dengan benar!');
        return false;
      }

      const updatedOrder = {
        name: updatedName,
        phone: updatedPhone,
        service: updatedService,
        weight: updatedWeight,
        totalPrice: `Rp${(updatedWeight * servicePrices[updatedService]).toLocaleString('id-ID')}`,
        date: order.date, // Tanggal tetap sama
        isPaid: order.isPaid, // Status pembayaran tetap sama
      };

      // Perbarui data pada indeks yang sesuai
      orders[index] = updatedOrder;
      localStorage.setItem('orders', JSON.stringify(orders));
      displayOrders(); // Tampilkan kembali daftar pesanan

      return updatedOrder;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Berhasil!', 'Pesanan berhasil diperbarui.', 'success');
    }
  });
}



function deleteOrder(index) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.splice(index, 1);
  localStorage.setItem('orders', JSON.stringify(orders));
  displayOrders();
  Swal.fire('Berhasil!', 'Pesanan berhasil dihapus.', 'success');
}

document.addEventListener('DOMContentLoaded', displayOrders);
// Ambil ID dari query parameter
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

// Gunakan orderId untuk menampilkan detail transaksi berdasarkan ID pesanan

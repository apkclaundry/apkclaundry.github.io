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

// Fungsi untuk menyimpan data ke database
document.getElementById('save-btn').addEventListener('click', async function () {
  const name = document.getElementById('customer-name').value;
  const phone = document.getElementById('customer-phone').value;
  const service = document.getElementById('service-type').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const totalPriceInput = document.getElementById('total-price').value.replace(/Rp|,/g, '');
  const totalPrice = parseFloat(totalPriceInput) * 1000;

  if (!name || !phone || !service || isNaN(weight) || weight <= 0 || isNaN(totalPrice)) {
    Swal.fire('Error', 'Harap isi semua data dengan benar!', 'error');
    return;
  }

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    Swal.fire('Error', 'Token tidak ditemukan. Silakan login ulang.', 'error');
    return;
  }

  const data = {
    customer_name: name,
    phone_number: phone,
    service_type: service,
    weight_per_kg: weight,
    total_price: totalPrice,
  };

  try {
    const response = await fetch('https://apkclaundry.vercel.app/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    Swal.fire('Berhasil!', 'Pesanan berhasil disimpan.', 'success').then(() => {
      window.location.href = 'dashboard.html';
    });
  } catch (error) {
    console.error('Error saat menyimpan data:', error);
    Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
  }
});

// Fungsi untuk mengambil data dari backend dan menampilkan di tabel
async function fetchOrders() {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      Swal.fire('Error', 'Token tidak ditemukan. Silakan login ulang.', 'error');
      return;
    }

    const response = await fetch('https://apkclaundry.vercel.app/transaction', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const orders = await response.json();

    const tableBody = document.querySelector('#order-table tbody');
    tableBody.innerHTML = '';
    orders.forEach(order => {
      const row = document.createElement('tr');
      row.dataset.id = order.id; // Pastikan menggunakan 'id' dari respons backend
      row.innerHTML = `
        <td>${order.customer_name}</td>
        <td>${order.phone_number}</td>
        <td>${order.service_type}</td>
        <td>${order.weight_per_kg}</td>
        <td>Rp${order.total_price.toLocaleString('id-ID')}</td>
        <td>${order.transaction_date || '-'}</td>
        <td style="color: ${order.isPaid ? 'green' : 'red'}; font-weight: bold;">${order.isPaid ? 'Paid' : 'Not Paid'}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Error saat mengambil data:', error);
    Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
  }
}

// Panggil fetchOrders saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchOrders);

// Event delegation untuk tombol Edit
document.querySelector('#order-table tbody').addEventListener('click', async function (event) {
  if (event.target.classList.contains('edit-btn')) {
    const row = event.target.closest('tr');
    const orderId = row.dataset.id; // Ambil ID dari atribut data-id

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://apkclaundry.vercel.app/transaction-id?id=${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const order = await response.json();

      Swal.fire({
        title: 'Edit Pesanan',
        html: `
          <label for="edit-name">Nama Pelanggan:</label>
          <input type="text" id="edit-name" class="swal2-input" value="${order.customer_name}" required>

          <label for="edit-phone">Nomor Telepon:</label>
          <input type="text" id="edit-phone" class="swal2-input" value="${order.phone_number}" required>

          <label for="edit-service">Jenis Layanan:</label>
          <select id="edit-service" class="swal2-input">
            <option value="cuci" ${order.service_type === 'cuci' ? 'selected' : ''}>Cuci</option>
            <option value="setrika" ${order.service_type === 'setrika' ? 'selected' : ''}>Setrika</option>
            <option value="cuci-setrika" ${order.service_type === 'cuci-setrika' ? 'selected' : ''}>Cuci + Setrika</option>
          </select>

          <label for="edit-weight">Berat (KG):</label>
          <input type="number" id="edit-weight" class="swal2-input" value="${order.weight_per_kg}" required>

          <label for="edit-total-price">Total Harga:</label>
          <input type="text" id="edit-total-price" class="swal2-input" value="${order.total_price}" readonly>
        `,
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

          return {
            customer_name: updatedName,
            phone_number: updatedPhone,
            service_type: updatedService,
            weight_per_kg: updatedWeight,
            total_price: updatedWeight * servicePrices[updatedService],
          };
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const updatedOrder = result.value;

          const updateResponse = await fetch(`https://apkclaundry.vercel.app/transaction-id?id=${orderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(updatedOrder),
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`HTTP error! status: ${updateResponse.status}, message: ${errorText}`);
          }

          Swal.fire('Berhasil!', 'Data pesanan berhasil diperbarui.', 'success');
          fetchOrders(); // Refresh tabel setelah pengeditan
        }
      });
    } catch (error) {
      console.error('Error saat mengedit data:', error);
      Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
    }
  }
});
// Event delegation untuk tombol Delete
document.querySelector('#order-table tbody').addEventListener('click', async function (event) {
  if (event.target.classList.contains('delete-btn')) {
    const row = event.target.closest('tr');
    const orderId = row.dataset.id; // Ambil ID dari atribut data-id

    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus data pesanan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const authToken = localStorage.getItem('authToken');
          if (!authToken) {
            Swal.fire('Error', 'Token tidak ditemukan. Silakan login ulang.', 'error');
            return;
          }

          // Kirim permintaan DELETE ke backend
          const response = await fetch(`https://apkclaundry.vercel.app/transaction-id?id=${orderId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          // Jika berhasil, tampilkan pesan sukses
          Swal.fire('Berhasil!', 'Data pesanan berhasil dihapus.', 'success');
          fetchOrders(); // Refresh tabel setelah penghapusan
        } catch (error) {
          console.error('Error saat menghapus data:', error);
          Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
        }
      }
    });
  }
});

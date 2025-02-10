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
  const totalPriceInput = document.getElementById('total-price').value.replace(/Rp|\./g, ''); // Hapus Rp dan titik
  const totalPrice = Number(totalPriceInput) || 0; // Konversi ke angka dengan aman

  if (!name || !phone || !service || isNaN(weight) || weight <= 0 || isNaN(totalPrice) || totalPrice <= 0) {
    Swal.fire('Error', 'Harap isi semua data dengan benar!', 'error');
    return;
  }

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    Swal.fire('Error', 'Token tidak ditemukan. Silakan login ulang.', 'error');
    return;
  }

  Swal.fire({
    title: 'Pilih Metode Pembayaran',
    html: `
      <select id="payment-method" class="swal2-input">
        <option value="cash">Cash</option>
        <option value="transfer">Transfer</option>
        <option value="qris">QRIS</option>
      </select>
      <div id="qris-image-container" style="display: none; margin-top: 10px;">
        <img id="qris-image" src="src/img/qris.png" alt="QRIS Code" style="width: 200px; height: auto;">
      </div>
      <div id="transfer-info" style="display: none; margin-top: 10px; font-weight: bold; font-size: 16px;">
        Nomor Rekening: <span id="rekening-number">6755554506</span>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Bayar Sekarang',
    cancelButtonText: 'Batal',
    didOpen: () => {
      const paymentMethodSelect = document.getElementById('payment-method');
      const qrisImageContainer = document.getElementById('qris-image-container');
      const transferInfo = document.getElementById('transfer-info');

      paymentMethodSelect.addEventListener('change', function () {
        if (this.value === 'qris') {
          qrisImageContainer.style.display = 'block';
          transferInfo.style.display = 'none';
        } else if (this.value === 'transfer') {
          transferInfo.style.display = 'block';
          qrisImageContainer.style.display = 'none';
        } else {
          qrisImageContainer.style.display = 'none';
          transferInfo.style.display = 'none';
        }
      });
    },
    preConfirm: () => {
      const paymentMethod = document.getElementById('payment-method').value;
      if (!paymentMethod) {
        Swal.showValidationMessage('Silakan pilih metode pembayaran!');
        return false;
      }
      return paymentMethod;
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const paymentMethod = result.value;

      const data = {
        customer_name: name,
        phone_number: phone,
        service_type: service,
        weight_per_kg: weight,
        total_price: totalPrice, // Sekarang sudah benar
        payment_method: paymentMethod,
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

        Swal.fire({
          title: 'Pembayaran Berhasil!',
          text: `Pesanan berhasil disimpan dengan metode ${paymentMethod}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          window.location.href = 'dashboard.html';
        });

      } catch (error) {
        console.error('Error saat menyimpan data:', error);
        Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
      }
    }
  });
});



let currentPage = 1;
const rowsPerPage = 5; // Ubah jumlah item per halaman di sini

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
    displayOrders(orders, currentPage);
    setupPagination(orders);
  } catch (error) {
    console.error('Error saat mengambil data:', error);
    Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
  }
}

function displayOrders(orders, page) {
  const tableBody = document.querySelector('#order-table tbody');
  const orderList = document.querySelector('.order-list');
  tableBody.innerHTML = '';
  orderList.innerHTML = '';

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedOrders = orders.slice(start, end);

  paginatedOrders.forEach(order => {


    if (order.payment_method === 'qris' || order.payment_method === 'transfer') {


    }

    // **Versi Desktop (Tabel)**
    const row = document.createElement('tr');
    row.dataset.id = order.id;
    row.innerHTML = `
      <td>${order.customer_name}</td>
      <td>${order.phone_number}</td>
      <td>${order.service_type}</td>
      <td>${order.weight_per_kg}</td>
      <td>Rp${order.total_price.toLocaleString('id-ID')}</td>
      <td>${order.transaction_date || '-'}</td>
      <td>${order.payment_method || '-'}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);

    // **Versi Mobile (Card)**
    const listItem = document.createElement("div");
    listItem.classList.add("order-item");
    listItem.dataset.id = order.id;
    listItem.innerHTML = `
      <p><strong>Nama Pelanggan:</strong> ${order.customer_name}</p>
      <p><strong>Nomor Telepon:</strong> ${order.phone_number}</p>
      <p><strong>Jenis Layanan:</strong> ${order.service_type}</p>
      <p><strong>Berat (KG):</strong> ${order.weight_per_kg}</p>
      <p><strong>Total Harga:</strong> Rp${order.total_price.toLocaleString("id-ID")}</p>
      <p><strong>Metode Pembayaran:</strong> ${order.payment_method || "-"}</p>

      </p>
      <div class="actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;
    orderList.appendChild(listItem);
  });
}

function setupPagination(orders) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const pageCount = Math.ceil(orders.length / rowsPerPage);

  const prevButton = document.createElement('button');
  prevButton.innerText = 'Previous';
  prevButton.classList.add('pagination-btn');
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayOrders(orders, currentPage);
      setupPagination(orders);
    }
  });

  paginationContainer.appendChild(prevButton);

  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerText = i;
    pageButton.classList.add('pagination-btn');
    if (currentPage === i) {
      pageButton.classList.add('active');
    }
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayOrders(orders, currentPage);
      setupPagination(orders);
    });
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.innerText = 'Next';
  nextButton.classList.add('pagination-btn');
  nextButton.disabled = currentPage === pageCount;
  nextButton.addEventListener('click', () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayOrders(orders, currentPage);
      setupPagination(orders);
    }
  });

  paginationContainer.appendChild(nextButton);
}

// **Panggil fetchOrders saat halaman dimuat**
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


// Fungsi untuk mengambil daftar pelanggan dari API dan mengisi dropdown
async function fetchCustomers() {
  try {
      const response = await fetch("https://apkclaundry.vercel.app/customers-name");
      if (!response.ok) throw new Error("Gagal mengambil data pelanggan.");

      const customers = await response.json();
      const customerSelect = document.getElementById("customer-name");

      // Reset dropdown
      customerSelect.innerHTML = `<option value="" disabled selected>Pilih Nama Pelanggan</option>`;

      customers.forEach(customer => {
          const option = document.createElement("option");
          option.value = customer.name;
          option.textContent = customer.name;
          customerSelect.appendChild(option);
      });
  } catch (error) {
      console.error("Error fetching customers:", error);
  }
}

// Pastikan fungsi hanya dipanggil sekali
document.addEventListener("DOMContentLoaded", fetchCustomers);

async function loadCustomerData() {
  try {
      const token = localStorage.getItem("authToken"); // Ambil token dari localStorage
      if (!token) {
          console.error("Token tidak ditemukan! Pastikan sudah login.");
          return;
      }

      const response = await fetch("https://apkclaundry.vercel.app/customers-name", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          }
      });

      if (!response.ok) throw new Error(`Gagal mengambil data pelanggan. Status: ${response.status}`);

      const customers = await response.json();

      // Simpan data pelanggan ke localStorage
      localStorage.setItem("customerData", JSON.stringify(customers));

      console.log("Data pelanggan berhasil diambil dan disimpan:", customers);
      populateCustomerDropdown();
  } catch (error) {
      console.error("Error fetching customers:", error);
  }
}

function populateCustomerDropdown() {
  const customerSelect = document.getElementById("customer-name");

  if (!customerSelect) {
      console.error("Dropdown pelanggan tidak ditemukan di DOM!");
      return;
  }

  // Ambil data pelanggan dari localStorage
  const storedCustomers = localStorage.getItem("customerData");

  if (storedCustomers) {
      const customers = JSON.parse(storedCustomers);
      console.log("Data pelanggan dari localStorage:", customers);

      // Reset dropdown sebelum mengisi ulang
      customerSelect.innerHTML = `<option value="" disabled selected>Pilih Nama Pelanggan</option>`;

      customers.forEach(customer => {
          const option = document.createElement("option");
          option.value = customer.name;
          option.textContent = customer.name;
          customerSelect.appendChild(option);
      });

      console.log("Dropdown pelanggan berhasil diisi!");
  } else {
      console.warn("Data pelanggan tidak ditemukan di localStorage.");
  }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadCustomerData();
  populateCustomerDropdown();
});




// Event delegation untuk daftar mobile
document.querySelector(".order-list").addEventListener("click", async function (event) {
  const target = event.target;

  if (target.classList.contains("edit-btn")) {
    const parentElement = target.closest(".order-item"); // Ambil elemen parent dengan class "order-item"
    const orderId = parentElement.dataset.id; // Ambil ID dari atribut data-id
    await handleEdit(orderId); // Panggil fungsi edit
  }

  if (target.classList.contains("delete-btn")) {
    const parentElement = target.closest(".order-item"); // Ambil elemen parent dengan class "order-item"
    const orderId = parentElement.dataset.id; // Ambil ID dari atribut data-id
    await handleDelete(orderId); // Panggil fungsi delete
  }
});

async function handleEdit(orderId) {
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


async function handleDelete(orderId) {
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

        Swal.fire('Berhasil!', 'Data pesanan berhasil dihapus.', 'success');
        fetchOrders(); // Refresh tabel setelah penghapusan
      } catch (error) {
        console.error('Error saat menghapus data:', error);
        Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
      }
    }
  });
}

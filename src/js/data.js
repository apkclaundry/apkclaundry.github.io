import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Ambil elemen-elemen yang diperlukan
const saveButton = document.getElementById("save-btn");
const customerForm = document.getElementById("customer-form");
const orderTableBody = document.querySelector("#order-table tbody");

// Ambil data pelanggan dari local storage
function getCustomers() {
  return JSON.parse(localStorage.getItem("customers")) || [];
}

// Simpan data pelanggan ke local storage
function saveCustomers(customers) {
  localStorage.setItem("customers", JSON.stringify(customers));
}

// Tambah pelanggan baru
function addCustomer() {
  const id = document.getElementById("customer-id").value.trim();
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  const email = document.getElementById("customer-email").value.trim();

  if (!id || !name || !phone || !address || !email) {
    alert("Semua field wajib diisi!");
    return;
  }

  const customers = getCustomers();
  customers.push({ id, name, phone, address, email });
  saveCustomers(customers);
  displayCustomers();
  customerForm.reset();
}

// Hapus pelanggan berdasarkan ID
function deleteCustomer(customerId) {
  let customers = getCustomers();
  customers = customers.filter((customer) => customer.id !== customerId);
  saveCustomers(customers);
  displayCustomers();
}

// Edit pelanggan
// Edit Customer Function with Swal
function editCustomer(customerId) {
    const customers = getCustomers();
    const customer = customers.find((c) => c.id === customerId);
  
    if (!customer) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Pelanggan tidak ditemukan!",
      });
      return;
    }
  
    Swal.fire({
      title: "Edit Data Pelanggan",
      html: `
        <div>
          <label for="edit-customer-id">ID Pelanggan:</label>
          <input type="text" id="edit-customer-id" class="swal2-input" value="${customer.id}" disabled />
        </div>
        <div>
          <label for="edit-customer-name">Nama:</label>
          <input type="text" id="edit-customer-name" class="swal2-input" value="${customer.name}" />
        </div>
        <div>
          <label for="edit-customer-phone">Nomor Telepon:</label>
          <input type="text" id="edit-customer-phone" class="swal2-input" value="${customer.phone}" />
        </div>
        <div>
          <label for="edit-customer-address">Alamat:</label>
          <input type="text" id="edit-customer-address" class="swal2-input" value="${customer.address}" />
        </div>
        <div>
          <label for="edit-customer-email">Email:</label>
          <input type="email" id="edit-customer-email" class="swal2-input" value="${customer.email}" />
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("edit-customer-name").value.trim();
        const phone = document.getElementById("edit-customer-phone").value.trim();
        const address = document.getElementById("edit-customer-address").value.trim();
        const email = document.getElementById("edit-customer-email").value.trim();
  
        if (!name || !phone || !address || !email) {
          Swal.showValidationMessage("Semua kolom harus diisi!");
          return false;
        }
  
        return { name, phone, address, email };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Update customer data
        customer.name = result.value.name;
        customer.phone = result.value.phone;
        customer.address = result.value.address;
        customer.email = result.value.email;
  
        // Save updated customers to local storage
        saveCustomers(customers);
        displayCustomers();
  
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data pelanggan berhasil diperbarui!",
        });
      }
    });
  }
  

// Pastikan fungsi tersedia secara global
window.deleteCustomer = deleteCustomer;
window.editCustomer = editCustomer;

// Tampilkan pelanggan dalam tabel
function displayCustomers() {
    const customers = getCustomers();
    orderTableBody.innerHTML = "";
  
    // Bersihkan tampilan mobile jika ada
    const orderList = document.querySelector(".order-list");
    if (orderList) {
      orderList.innerHTML = "";
    }
  
    customers.forEach((customer) => {
      // Tambahkan data ke tabel desktop
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.address}</td>
        <td>${customer.email}</td>
        <td>
          <button class="btn-edit" onclick="editCustomer('${customer.id}')">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn-delete" onclick="deleteCustomer('${customer.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      orderTableBody.appendChild(row);
  
      // Tambahkan data ke tampilan mobile
      if (orderList) {
        const listItem = document.createElement("div");
        listItem.classList.add("order-item");
        listItem.innerHTML = `
          <p><strong>ID Pelanggan:</strong> ${customer.id}</p>
          <p><strong>Nama Pelanggan:</strong> ${customer.name}</p>
          <p><strong>Nomor Telepon:</strong> ${customer.phone}</p>
          <p><strong>Alamat:</strong> ${customer.address}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <div class="actions">
            <button class="btn-edit" onclick="editCustomer('${customer.id}')">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="btn-delete" onclick="deleteCustomer('${customer.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        orderList.appendChild(listItem);
      }
    });
  }
  
// Event listener untuk tombol Simpan
saveButton.addEventListener("click", addCustomer);

// Tampilkan data pelanggan saat halaman dimuat
document.addEventListener("DOMContentLoaded", displayCustomers);

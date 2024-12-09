import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Ambil elemen-elemen yang diperlukan
const saveButton = document.getElementById("save-btn");
const supplierForm = document.getElementById("supplier-form");
const supplierTableBody = document.querySelector("#supplier-table tbody");
const supplierList = document.querySelector(".supplier-list");

// Ambil data supplier dari local storage
function getSuppliers() {
  return JSON.parse(localStorage.getItem("suppliers")) || [];
}

// Simpan data supplier ke local storage
function saveSuppliers(suppliers) {
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

// Tambah supplier baru
function addSupplier() {
  const id = document.getElementById("supplier-id").value.trim();
  const name = document.getElementById("supplier-name").value.trim();
  const phone = document.getElementById("supplier-phone").value.trim();
  const address = document.getElementById("supplier-address").value.trim();
  const email = document.getElementById("supplier-email").value.trim();
  const products = document.getElementById("supplier-products").value.trim();

  if (!id || !name || !phone || !address || !email || !products) {
    Swal.fire({
      icon: "warning",
      title: "Form Tidak Lengkap",
      text: "Semua kolom wajib diisi!",
    });
    return;
  }

  const suppliers = getSuppliers();
  suppliers.push({ id, name, phone, address, email, products });
  saveSuppliers(suppliers);
  displaySuppliers();
  supplierForm.reset();

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Supplier berhasil ditambahkan!",
  });
}

// Hapus supplier berdasarkan ID
function deleteSupplier(supplierId) {
  let suppliers = getSuppliers();
  suppliers = suppliers.filter((supplier) => supplier.id !== supplierId);
  saveSuppliers(suppliers);
  displaySuppliers();

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Supplier berhasil dihapus!",
  });
}

// Edit supplier dengan Swal
function editSupplier(supplierId) {
  const suppliers = getSuppliers();
  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!supplier) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Supplier tidak ditemukan!",
    });
    return;
  }

  Swal.fire({
    title: "Edit Data Supplier",
    html: `
      <div>
        <label for="edit-supplier-id">ID Supplier:</label>
        <input type="text" id="edit-supplier-id" class="swal2-input" value="${supplier.id}" disabled />
      </div>
      <div>
        <label for="edit-supplier-name">Nama:</label>
        <input type="text" id="edit-supplier-name" class="swal2-input" value="${supplier.name}" />
      </div>
      <div>
        <label for="edit-supplier-phone">Nomor Telepon:</label>
        <input type="text" id="edit-supplier-phone" class="swal2-input" value="${supplier.phone}" />
      </div>
      <div>
        <label for="edit-supplier-address">Alamat:</label>
        <input type="text" id="edit-supplier-address" class="swal2-input" value="${supplier.address}" />
      </div>
      <div>
        <label for="edit-supplier-email">Email:</label>
        <input type="email" id="edit-supplier-email" class="swal2-input" value="${supplier.email}" />
      </div>
      <div>
        <label for="edit-supplier-products">Produk yang Disuplai:</label>
        <textarea id="edit-supplier-products" class="swal2-textarea">${supplier.products}</textarea>
      </div>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById("edit-supplier-name").value.trim();
      const phone = document.getElementById("edit-supplier-phone").value.trim();
      const address = document.getElementById("edit-supplier-address").value.trim();
      const email = document.getElementById("edit-supplier-email").value.trim();
      const products = document.getElementById("edit-supplier-products").value.trim();

      if (!name || !phone || !address || !email || !products) {
        Swal.showValidationMessage("Semua kolom harus diisi!");
        return false;
      }

      return { name, phone, address, email, products };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      supplier.name = result.value.name;
      supplier.phone = result.value.phone;
      supplier.address = result.value.address;
      supplier.email = result.value.email;
      supplier.products = result.value.products;

      saveSuppliers(suppliers);
      displaySuppliers();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data supplier berhasil diperbarui!",
      });
    }
  });
}

// Pastikan fungsi tersedia secara global
window.deleteSupplier = deleteSupplier;
window.editSupplier = editSupplier;

// Tampilkan supplier dalam tabel
function displaySuppliers() {
  const suppliers = getSuppliers();
  supplierTableBody.innerHTML = "";
  supplierList.innerHTML = "";

  suppliers.forEach((supplier) => {
    // Tambahkan ke tabel
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${supplier.id}</td>
      <td>${supplier.name}</td>
      <td>${supplier.phone}</td>
      <td>${supplier.address}</td>
      <td>${supplier.email}</td>
      <td>${supplier.products}</td>
      <td>
        <button class="btn-edit" onclick="editSupplier('${supplier.id}')">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn-delete" onclick="deleteSupplier('${supplier.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    supplierTableBody.appendChild(row);

    // Tambahkan ke tampilan mobile
    const listItem = document.createElement("div");
    listItem.classList.add("supplier-item");
    listItem.innerHTML = `
      <p><strong>ID Supplier:</strong> ${supplier.id}</p>
      <p><strong>Nama:</strong> ${supplier.name}</p>
      <p><strong>Nomor Telepon:</strong> ${supplier.phone}</p>
      <p><strong>Alamat:</strong> ${supplier.address}</p>
      <p><strong>Email:</strong> ${supplier.email}</p>
      <p><strong>Produk:</strong> ${supplier.products}</p>
      <div class="actions">
        <button class="btn-edit" onclick="editSupplier('${supplier.id}')">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn-delete" onclick="deleteSupplier('${supplier.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    supplierList.appendChild(listItem);
  });
}

// Event listener untuk tombol Simpan
saveButton.addEventListener("click", addSupplier);

// Tampilkan data supplier saat halaman dimuat
document.addEventListener("DOMContentLoaded", displaySuppliers);

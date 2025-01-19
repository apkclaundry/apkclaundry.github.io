import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Fungsi untuk mendapatkan token dari localStorage
function getAuthToken() {
  const token = localStorage.getItem("authToken");
  console.log("Token retrieved from localStorage:", token); // Debug log
  if (!token) {
    Swal.fire({
      title: "Error!",
      text: "Token tidak ditemukan, silakan login kembali.",
      icon: "error",
      confirmButtonText: "Login",
    }).then(() => {
      window.location.href = "/login.html"; // Ganti dengan halaman login Anda
    });
    throw new Error("Token tidak ditemukan di localStorage.");
  }
  return token;
}

async function getSuppliers() {
  const token = getAuthToken();
  try {
    const response = await fetch('https://apkclaundry.vercel.app/supplier', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error('Gagal mengambil data supplier');
    const suppliers = await response.json();
    return suppliers;
  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.message, 'error');
    return [];
  }
}

async function addSupplier() {
  const token = getAuthToken();
  const supplierName = document.getElementById("supplier-name").value.trim();
  const phoneNumber = document.getElementById("supplier-phone").value.trim();
  const address = document.getElementById("supplier-address").value.trim();
  const email = document.getElementById("supplier-email").value.trim();
  const suppliedProducts = document
    .getElementById("supplier-products")
    .value.trim()
    .split(","); // Mengubah string menjadi array

  if (!supplierName || !phoneNumber || !address || !email || !suppliedProducts.length) {
    Swal.fire('Peringatan', 'Semua field wajib diisi!', 'warning');
    return;
  }

  try {
    const response = await fetch('https://apkclaundry.vercel.app/supplier', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ supplier_name: supplierName, phone_number: phoneNumber, address, email, supplied_products: suppliedProducts })
    });

    if (!response.ok) throw new Error('Gagal menambahkan supplier');
    Swal.fire('Sukses', 'Supplier berhasil ditambahkan!', 'success');
    displaySuppliers();
    document.getElementById("supplier-form").reset(); // Reset form
  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.message, 'error');
  }
}

async function editSupplier(supplierId) {
  const token = getAuthToken();
  console.log('Edit Supplier ID:', supplierId); // Debugging
  if (!supplierId) {
    Swal.fire('Error', 'ID supplier tidak ditemukan', 'error');
    return;
  }

  try {
    const response = await fetch(`https://apkclaundry.vercel.app/supplier-id?id=${supplierId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error('Gagal mengambil data supplier');
    
    const supplier = await response.json();
    console.log('Supplier data:', supplier); // Debugging

    Swal.fire({
      title: 'Edit Data Supplier',
      html: `
        <input id="swal-name" class="swal2-input" value="${supplier.supplier_name}" placeholder="Nama Supplier">
        <input id="swal-phone" class="swal2-input" value="${supplier.phone_number}" placeholder="Telepon">
        <input id="swal-address" class="swal2-input" value="${supplier.address}" placeholder="Alamat">
        <input id="swal-email" class="swal2-input" value="${supplier.email}" placeholder="Email">
        <textarea id="swal-products" class="swal2-textarea" placeholder="Produk yang Disuplai">${supplier.supplied_products.join(", ")}</textarea>
      `,
      focusConfirm: false,
      preConfirm: async () => {
        const supplier_name = document.getElementById('swal-name').value.trim();
        const phone_number = document.getElementById('swal-phone').value.trim();
        const address = document.getElementById('swal-address').value.trim();
        const email = document.getElementById('swal-email').value.trim();
        const supplied_products = document
          .getElementById('swal-products')
          .value.trim()
          .split(","); // Mengubah input menjadi array

        if (!supplier_name || !phone_number || !address || !email || !supplied_products.length) {
          Swal.showValidationMessage("Mohon lengkapi data!");
          return;
        }
        
        try {
          const updateResponse = await fetch(`https://apkclaundry.vercel.app/supplier-id?id=${supplierId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ supplier_name, phone_number, address, email, supplied_products })
          });

          if (!updateResponse.ok) throw new Error('Gagal memperbarui data supplier');
          Swal.fire('Sukses', 'Data supplier diperbarui!', 'success');
          displaySuppliers();
        } catch (error) {
          console.error("Error updating supplier:", error);
          Swal.fire("Error!", "Gagal memperbarui data supplier.", "error");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal mengambil data supplier.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fungsi untuk menghapus supplier
async function deleteSupplier(supplierId) {
  const token = getAuthToken();
  console.log('Delete Supplier ID:', supplierId); // Debugging
  if (!supplierId) {
    Swal.fire('Error', 'ID supplier tidak ditemukan', 'error');
    return;
  }

  Swal.fire({
    title: "Anda yakin?",
    text: "Data supplier ini akan dihapus!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://apkclaundry.vercel.app/supplier-id?id=${supplierId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        Swal.fire("Dihapus!", "Data supplier telah dihapus.", "success");
        displaySuppliers(); // Refresh data
      } catch (error) {
        console.error("Error deleting supplier:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data supplier.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  });
}

async function displaySuppliers() {
  const suppliers = await getSuppliers();

  orderTableBody.innerHTML = "";

  suppliers.forEach(supplier => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${supplier.id}</td>
      <td>${supplier.supplier_name}</td>
      <td>${supplier.phone_number}</td>
      <td>${supplier.address}</td>
      <td>${supplier.email}</td>
      <td>${supplier.supplied_products.join(", ")}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editSupplier('${supplier.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    orderTableBody.appendChild(row);
  });
}

const saveButton = document.getElementById("save-btn");
const orderTableBody = document.querySelector("#supplier-table tbody");

if (saveButton) {
  // Event listener untuk menambahkan supplier
  saveButton.addEventListener("click", addSupplier);
} else {
  console.error("saveButton element not found");
}

// Tampilkan supplier saat halaman dimuat
document.addEventListener("DOMContentLoaded", displaySuppliers);
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;


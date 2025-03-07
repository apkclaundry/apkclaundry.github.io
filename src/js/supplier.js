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
    const response = await fetch("https://apkclaundry.vercel.app/supplier", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Gagal mengambil data supplier");

    const result = await response.json();
    console.log("Response dari API:", result); // Debugging

    if (!Array.isArray(result)) {
      throw new Error("Format data tidak sesuai, seharusnya array.");
    }

    return result; // Mengembalikan langsung array supplier
  } catch (error) {
    console.error("Error saat mengambil supplier:", error.message);
    Swal.fire("Error", error.message, "error");
    return [];
  }
}

async function editSupplier(supplierId) {
  const token = getAuthToken();
  if (!supplierId) {
    Swal.fire("Error", "ID supplier tidak ditemukan", "error");
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

    if (!response.ok) throw new Error("Gagal mengambil data supplier");
    
    const supplier = await response.json();

    Swal.fire({
      title: "Edit Data Supplier",
      html: `
        <input id="swal-name" class="swal2-input" value="${supplier.supplier_name}" placeholder="Nama Supplier">
        <input id="swal-phone" class="swal2-input" value="${supplier.phone_number}" placeholder="Telepon">
        <input id="swal-address" class="swal2-input" value="${supplier.address}" placeholder="Alamat">
        <input id="swal-email" class="swal2-input" value="${supplier.email}" placeholder="Email">
        <textarea id="swal-products" class="swal2-textarea" placeholder="Produk yang Disuplai">${supplier.supplied_products.join(", ")}</textarea>
      `,
      focusConfirm: false,
      preConfirm: async () => {
        const supplier_name = document.getElementById("swal-name").value.trim();
        const phone_number = document.getElementById("swal-phone").value.trim();
        const address = document.getElementById("swal-address").value.trim();
        const email = document.getElementById("swal-email").value.trim();
        const supplied_products = document.getElementById("swal-products").value.trim().split(",");

        if (!supplier_name || !phone_number || !address || !email || !supplied_products.length) {
          Swal.showValidationMessage("Mohon lengkapi data!");
          return;
        }

        try {
          const updateResponse = await fetch(`https://apkclaundry.vercel.app/supplier-id?id=${supplierId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ supplier_name, phone_number, address, email, supplied_products }),
          });

          if (!updateResponse.ok) throw new Error("Gagal memperbarui data supplier");
          Swal.fire("Sukses", "Data supplier diperbarui!", "success");
          displaySuppliers();
        } catch (error) {
          console.error("Error updating supplier:", error);
          Swal.fire("Error!", "Gagal memperbarui data supplier.", "error");
        }
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    Swal.fire("Error!", "Gagal mengambil data supplier.", "error");
  }
}

// Fungsi untuk menambahkan supplier
async function addSupplier() {
  const token = getAuthToken();
  const supplier_name = document.getElementById("supplier-name").value.trim();
  const phone_number = document.getElementById("supplier-phone").value.trim();
  const address = document.getElementById("supplier-address").value.trim();
  const email = document.getElementById("supplier-email").value.trim();
  const supplied_products = document.getElementById("supplier-products").value.trim().split(",");

  if (!supplier_name || !phone_number || !address || !email || !supplied_products.length) {
    Swal.fire("Error", "Mohon lengkapi data!", "error");
    return;
  }

  try {
    const response = await fetch("https://apkclaundry.vercel.app/supplier", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ supplier_name, phone_number, address, email, supplied_products }),
    });

    if (!response.ok) throw new Error("Gagal menambahkan supplier");
    Swal.fire("Sukses", "Supplier berhasil ditambahkan!", "success");
    displaySuppliers();
  } catch (error) {
    console.error("Error adding supplier:", error);
    Swal.fire("Error!", "Gagal menambahkan supplier.", "error");
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

// Fungsi untuk menampilkan supplier
async function displaySuppliers() {
  const suppliers = await getSuppliers();

  const orderTableBody = document.querySelector("#supplier-table tbody");
  const supplierList = document.querySelector(".supplier-list");
  const transactionTableBody = document.getElementById("transactionTableBody");

  orderTableBody.innerHTML = "";
  supplierList.innerHTML = "";
  transactionTableBody.innerHTML = "";

  suppliers.forEach((supplier) => {
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
        <button class="btn btn-sm btn-success" onclick="addSupplierTransaction('${supplier.id}')">
          <i class="fas fa-plus"></i> Transaksi
        </button>
      </td>
    `;
    orderTableBody.appendChild(row);

    // Buat tampilan supplier dalam bentuk kartu
    const card = document.createElement("div");
    card.classList.add("supplier-item");
    card.innerHTML = `
      <p><strong>ID:</strong> ${supplier.id}</p>
      <p><strong>Nama:</strong> ${supplier.supplier_name}</p>
      <p><strong>Nomor Telepon:</strong> ${supplier.phone_number}</p>
      <p><strong>Alamat:</strong> ${supplier.address}</p>
      <p><strong>Email:</strong> ${supplier.email}</p>
      <p><strong>Produk yang Disuplai:</strong> ${supplier.supplied_products.map((p) => `<li>${p.trim()}</li>`).join("")}</p>
      
      <h4>Transaksi</h4>
      ${supplier.transactions && supplier.transactions.length > 0 ? `
        <ul>
          ${supplier.transactions.map(transaction => `
            <li>
              <strong>ID Transaksi:</strong> ${transaction.transaction_id} <br>
              <strong>Total:</strong> Rp${transaction.total_amount.toLocaleString()} <br>
              <strong>Metode Pembayaran:</strong> ${transaction.payment_method} <br>
              <strong>Tanggal:</strong> ${new Date(transaction.date).toLocaleDateString()} <br>
              <strong>Item:</strong> 
              <ul>
                ${transaction.items_purchased.map(item => `
                  <li>${item.item_name} - ${item.quantity} x Rp${item.unit_price.toLocaleString()} = Rp${item.total_price.toLocaleString()}</li>
                `).join("")}
              </ul>
            </li>
          `).join("")}
        </ul>
      ` : `<p>Tidak ada transaksi</p>`}

      <div class="actions">
        <button class="btn btn-sm btn-warning" onclick="editSupplier('${supplier.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')">
          <i class="fas fa-trash"></i>
        </button>
        <button class="btn btn-sm btn-success" onclick="addSupplierTransaction('${supplier.id}')">
          <i class="fas fa-plus"></i> Transaksi
        </button>
      </div>
    `;
    
    supplierList.appendChild(card);

    // Tambahkan transaksi ke tabel transaksi
    supplier.transactions.forEach(transaction => {
      const transactionRow = document.createElement("tr");
      transactionRow.innerHTML = `
        <td>${transaction.transaction_id}</td>
        <td>${supplier.supplier_name}</td>
        <td>${new Date(transaction.date).toLocaleDateString()}</td>
        <td>Rp${transaction.total_amount.toLocaleString()}</td>
        <td>${transaction.payment_method}</td>
      `;
      transactionTableBody.appendChild(transactionRow);
    });
  });
}

async function addSupplierTransaction(supplierId) {
  const token = getAuthToken();
  if (!supplierId) {
    Swal.fire("Error", "ID supplier tidak ditemukan", "error");
    return;
  }

  Swal.fire({
    title: "Tambah Transaksi Supplier",
    html: `
      <input id="swal-transaction-total" class="swal2-input" placeholder="Total Transaksi">
      <input id="swal-transaction-method" class="swal2-input" placeholder="Metode Pembayaran">
      <input id="swal-transaction-date" class="swal2-input" type="date" placeholder="Tanggal Transaksi">
      <textarea id="swal-transaction-items" class="swal2-textarea" placeholder="Item (format: nama, jumlah, harga)"></textarea>
    `,
    focusConfirm: false,
    preConfirm: async () => {
      const total_amount = parseFloat(document.getElementById("swal-transaction-total").value.trim());
      const payment_method = document.getElementById("swal-transaction-method").value.trim();
      const date = new Date(document.getElementById("swal-transaction-date").value).toISOString();
      const itemsInput = document.getElementById("swal-transaction-items").value.trim();

      if (isNaN(total_amount) || !payment_method || !date || !itemsInput) {
        Swal.showValidationMessage("Mohon lengkapi data transaksi!");
        return;
      }

      // Konversi input item ke format JSON
      const items_purchased = itemsInput.split("\n").map((item) => {
        const parts = item.split(",").map((i) => i.trim());
        if (parts.length !== 3) {
          Swal.showValidationMessage("Format item tidak valid! Gunakan format: nama, jumlah, harga per item");
          return null;
        }
        
        const [item_name, quantity, unit_price] = parts;
        if (!item_name || isNaN(quantity) || isNaN(unit_price)) {
          Swal.showValidationMessage("Format item salah! Gunakan format: nama, jumlah, harga");
          return null;
        }
      
        return {
          item_name,
          quantity: parseInt(quantity),
          unit_price: parseFloat(unit_price),
          total_price: parseFloat((parseInt(quantity) * parseFloat(unit_price)).toFixed(2))
        };
      }).filter(item => item !== null);

      // Validasi apakah semua item valid
      if (items_purchased.some((item) => !item)) return;

      try {
        const response = await fetch(`https://apkclaundry.vercel.app/supplier/transaction?supplier_id=${supplierId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            total_amount,
            payment_method,
            date,
            items_purchased,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Gagal menambahkan transaksi supplier");
        }
        Swal.fire("Sukses", "Transaksi supplier berhasil ditambahkan!", "success");
        displaySuppliers();
      } catch (error) {
        console.error("Error adding supplier transaction:", error);
        Swal.fire("Error!", error.message, "error");
      }
    },
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
window.addSupplierTransaction = addSupplierTransaction;


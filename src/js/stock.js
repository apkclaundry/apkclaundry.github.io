import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

const saveButton = document.getElementById("save-btn");
const stockForm = document.getElementById("customer-form");

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

// Fungsi untuk mengambil semua pelanggan
async function getStocks() {
    const token = getAuthToken();
    try {
        const response = await fetch('https://apkclaundry.vercel.app/stock', {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.status === 401) {
            Swal.fire('Unauthorized', 'Please log in to access this resource', 'warning').then(() => {
                window.location.href = '/login'; // Redirect to login page
            });
            return [];
        }
        if (response.status === 404) throw new Error('Data stok tidak ditemukan');
        if (!response.ok) throw new Error('Gagal mengambil data stok');
        const stocks = await response.json();
        return stocks;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
        return [];
    }
}

// Fungsi untuk menambahkan stok baru
async function addStock() {
    const name = document.getElementById("item-name").value.trim();
    const quantity = document.getElementById("item-stock").value.trim();
    const price = document.getElementById("item-price").value.trim();

    if (!name || !quantity || !price) {
        Swal.fire('Peringatan', 'Semua field wajib diisi!', 'warning');
        return;
    }

    const token = getAuthToken();
    try {
        const response = await fetch('https://apkclaundry.vercel.app/stock', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, address, email })
        });

        if (!response.ok) throw new Error('Gagal menambahkan stok');
        Swal.fire('Sukses', 'Stok berhasil ditambahkan!', 'success');
        displayCustomers();
        stockForm.reset();
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
    }
}

// Fungsi untuk menampilkan data stok
async function fetchStocks() {
  const token = getAuthToken();

  try {
    console.log("Fetching stocks with token:", token);

    const response = await fetch("https://apkclaundry.vercel.app/stock", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stocks = await response.json();
    console.log("Stocks fetched:", stocks);
    displayStocks(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal mengambil data stok.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fungsi untuk menampilkan data ke tabel
// Fungsi untuk menampilkan data stok dalam tabel (Desktop) dan kartu (Mobile)
async function displayStocks() {
  const stocks = await getStocks();

  const stockTableBody = document.querySelector("#stock-table tbody");
  const stockList = document.querySelector(".stock-list");

  if (!stockTableBody || !stockList) {
      console.error("Elemen tabel atau daftar stok tidak ditemukan di DOM.");
      return;
  }

  // Reset tabel dan daftar
  stockTableBody.innerHTML = "";
  stockList.innerHTML = "";

  stocks.forEach((stock) => {
      // **Tampilan Tabel (Desktop)**
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${stock.id}</td>
          <td>${stock.item_name}</td>
          <td>${stock.quantity}</td>
          <td>${formatRupiah(stock.price)}</td>
          <td class="actions">
              <button class="edit" onclick="editStock('${stock.id}')">&#9998;</button>
              <button class="delete" onclick="deleteStock('${stock.id}')">&#128465;</button>
          </td>
      `;
      stockTableBody.appendChild(row);

      // **Tampilan Card (Mobile)**
      const listItem = document.createElement("div");
      listItem.classList.add("stock-item");
      listItem.dataset.id = stock.id; // Menyimpan ID barang
      listItem.innerHTML = `
          <p><strong>ID Barang:</strong> ${stock.id}</p>
          <p><strong>Nama Barang:</strong> ${stock.item_name}</p>
          <p><strong>Stok:</strong> ${stock.quantity}</p>
          <p><strong>Harga per Unit:</strong> ${formatRupiah(stock.price)}</p>
          <div class="actions">
              <button class="edit" onclick="editStock('${stock.id}')">Edit</button>
              <button class="delete" onclick="deleteStock('${stock.id}')">Hapus</button>
          </div>
      `;
      stockList.appendChild(listItem);
  });
}




// Fungsi untuk mengedit data stok
async function editStock(id) {
  const token = getAuthToken();

  try {
    const response = await fetch(`https://apkclaundry.vercel.app/stock-id?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data stok.");
    }

    const stock = await response.json();

    Swal.fire({
      title: "Edit Barang",
      html: `
        <label for="swal-input-item_name">Nama Barang</label>
        <input id="swal-input-item_name" class="swal2-input" value="${stock.item_name}">
        <label for="swal-input-quantity">Jumlah</label>
        <input id="swal-input-quantity" class="swal2-input" type="number" value="${stock.quantity}">
        <label for="swal-input-price">Harga per Unit</label>
        <input id="swal-input-price" class="swal2-input" type="number" value="${stock.price}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: async () => {
        const item_name = document.getElementById("swal-input-item_name").value.trim();
        const quantity = parseInt(document.getElementById("swal-input-quantity").value.trim());
        const price = parseFloat(document.getElementById("swal-input-price").value.trim());

        if (!item_name || quantity < 0 || price < 0) {
          Swal.showValidationMessage("Semua bidang harus diisi dengan benar!");
          return false;
        }

        try {
          const updateResponse = await fetch(`https://apkclaundry.vercel.app/stock-id?id=${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ item_name, quantity, price }),
          });

          if (!updateResponse.ok) {
            throw new Error("Gagal memperbarui data stok.");
          }

          Swal.fire("Berhasil!", "Data stok berhasil diperbarui.", "success");
          fetchStocks(); // Refresh data
        } catch (error) {
          console.error("Error updating stock:", error);
          Swal.fire("Error!", "Gagal memperbarui data stok.", "error");
        }
      },
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal mengambil data stok.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fungsi untuk menambahkan data stok
document.getElementById("stock-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAuthToken();
  const item_name = document.getElementById("item-name").value.trim();
  const quantity = parseInt(document.getElementById("item-stock").value.trim());
  const price = parseFloat(document.getElementById("item-price").value.trim());

  if (!item_name || quantity < 0 || price < 0) {
    Swal.fire({
      title: "Peringatan!",
      text: "Mohon lengkapi semua data dengan benar!",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    const response = await fetch("https://apkclaundry.vercel.app/stock", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item_name, quantity, price }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    Swal.fire("Berhasil!", "Data stok berhasil ditambahkan.", "success");
    fetchStocks(); // Refresh data
    document.getElementById("stock-form").reset();
  } catch (error) {
    console.error("Error adding stock:", error);
    Swal.fire({
      title: "Error!",
      text: "Gagal menambahkan data stok.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});

// Fungsi untuk menghapus stok
async function deleteStock(id) {
  const token = getAuthToken();

  Swal.fire({
    title: "Anda yakin?",
    text: "Data barang ini akan dihapus!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://apkclaundry.vercel.app/stock-id?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        Swal.fire("Dihapus!", "Data barang telah dihapus.", "success");
        fetchStocks(); // Refresh data
      } catch (error) {
        console.error("Error deleting stock:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data stok.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  });
}

window.editStock = editStock;
window.deleteStock = deleteStock;

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(number);
}

// Event listener untuk menambahkan pelanggan
saveButton.addEventListener("click", addStock);


window.addEventListener("load", fetchStocks);

// Fetch available items from the backend and populate the select dropdown
// Fungsi untuk mengambil daftar pelanggan dari API dan mengisi dropdown
async function fetchItems() {
    try {
        const response = await fetch("https://apkclaundry.vercel.app/item-name");
        if (!response.ok) throw new Error("Gagal mengambil data item.");
  
        const items = await response.json();
        const itemSelect = document.getElementById("item-name");
  
        // Reset dropdown
        itemSelect.innerHTML = `<option value="" disabled selected>Pilih Nama barang</option>`;
  
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.name;
            option.textContent = item.name;
            itemSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching items:", error);
    }
  }


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

// Fungsi untuk menampilkan data stok
async function fetchStocksTransactions() {
    const token = getAuthToken();

    if (!token) {
        console.error("Token autentikasi tidak ditemukan.");
        Swal.fire({
            title: "Error!",
            text: "Anda harus login untuk melihat transaksi stok.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    try {
        console.log("Fetching stocks transactions with token:", token);

        const response = await fetch("https://apkclaundry.vercel.app/item-transaction", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Response status:", response.status);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const stockstransactions = await response.json();
        if (!Array.isArray(stockstransactions)) {
            console.error("Data transaksi stok bukan array:", stockstransactions);
            return;
        }

        console.log("Stocks transactions fetched:", stockstransactions);
        displayStocksTransactions(stockstransactions);
    } catch (error) {
        console.error("Error fetching stocks transactions:", error);
        Swal.fire({
            title: "Error!",
            text: "Gagal mengambil data transaksi stok.",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
}

// Fungsi untuk menampilkan data stok dalam tabel (Desktop) dan kartu (Mobile)
function displayStocksTransactions(stockstransactions) {
    const stocktransactionTableBody = document.querySelector("#stocktransaction-table tbody");
    const stocktransactionList = document.querySelector(".stocktransaction-list");

    if (!stocktransactionTableBody || !stocktransactionList) {
        console.error("Elemen tabel atau daftar stok tidak ditemukan di DOM.");
        return;
    }

    // Reset tabel dan daftar
    stocktransactionTableBody.innerHTML = "";
    stocktransactionList.innerHTML = "";

    if (stockstransactions.length === 0) {
        stocktransactionTableBody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Belum ada transaksi stok</td></tr>";
        stocktransactionList.innerHTML = "<p style='text-align: center;'>Belum ada transaksi stok</p>";
        return;
    }

    stockstransactions.forEach((stocktransaction) => {
        // **Tampilan Tabel (Desktop)**
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${stocktransaction.id_transaksi}</td>
            <td>${stocktransaction.id_barang}</td>
            <td>${stocktransaction.item_name}</td>
            <td>${new Date(stocktransaction.tanggal).toLocaleDateString()}</td>
            <td>${stocktransaction.jenis_transaksi}</td>
            <td>${stocktransaction.jumlah}</td>
            <td>${stocktransaction.stok_setelah}</td>
            <td class="actions">
                <button class="edit" onclick="editStock('${stocktransaction.id}')">&#9998;</button>
                <button class="delete" onclick="deleteStock('${stocktransaction.id}')">&#128465;</button>
            </td>
        `;
        stocktransactionTableBody.appendChild(row);

        // **Tampilan Card (Mobile)**
        const listItem = document.createElement("div");
        listItem.classList.add("stocktransaction-item");
        listItem.dataset.id = stocktransaction.id;
        listItem.innerHTML = `
            <p><strong>ID Transaksi:</strong> ${stocktransaction.id}</p>
            <p><strong>ID Barang:</strong> ${stocktransaction.id_barang}</p>
            <p><strong>Tanggal:</strong> ${new Date(stocktransaction.tanggal).toLocaleDateString()}</p>
            <p><strong>Jenis Transaksi:</strong> ${stocktransaction.jenis_transaksi}</p>
            <p><strong>Jumlah:</strong> ${stocktransaction.jumlah}</p>
            <p><strong>Stok Setelah:</strong> ${stocktransaction.stok_setelah}</p>
            <div class="actions">
                <button class="edit" onclick="editStock('${stocktransaction.id}')">Edit</button>
                <button class="delete" onclick="deleteStock('${stocktransaction.id}')">Hapus</button>
            </div>
        `;
        stocktransactionList.appendChild(listItem);
    });
}

// Panggil fungsi saat halaman dimuat

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadCustomerData();
    populateCustomerDropdown();
    fetchItems();
    fetchStocksTransactions();
});

document.getElementById('save-btn').addEventListener('click', function (event) {
    event.preventDefault();

    const itemId = document.getElementById('itemID').value;  // Perbaiki ID sesuai
    const quantity = document.getElementById('quantity').value;
    const type = document.getElementById('transactionType').value;

    fetch('https://apkclaundry.vercel.app/item-transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_barang: itemId,
            jumlah: parseInt(quantity),
            jenis_transaksi: type  // Sesuaikan field nama
        })
    })
        .then(response => response.json())
        .then(_data => {
            alert('Transaksi berhasil disimpan');
            updateStockTransactionTable(); // Perbarui tabel stok
            updateStockTransactionCards(); // Perbarui kartu transaksi stok
        })
        .catch(error => console.error('Error saving stock transaction:', error));
});



// Perbarui fungsi update stok transaksi
function updateStockTransactionTable() {
    fetch('https://apkclaundry.vercel.app/item-transaction')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('stocktransaction-table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Kosongkan tabel sebelumnya

            data.forEach(stocktransaction => {
                const row = tableBody.insertRow();
                row.innerHTML = `
            <td>${stocktransaction.id}</td>
            <td>${stocktransaction.id_barang}</td>
            <td>${new Date(stocktransaction.tanggal).toLocaleDateString()}</td>
            <td>${stocktransaction.jenis_transaksi}</td>
            <td>${stocktransaction.jumlah}</td>
            <td>${stocktransaction.stok_setelah}</td>
            <td class="actions">
                <button class="edit" onclick="editStock('${stocktransaction.id}')">&#9998;</button>
                <button class="delete" onclick="deleteStock('${stocktransaction.id}')">&#128465;</button>
            </td>
          `;
            });
        })
        .catch(error => console.error('Error fetching transactions:', error));
}

// Update Kartu Transaksi
function updateStockTransactionCards() {
    fetch('https://apkclaundry.vercel.app/item-transaction')
        .then(response => response.json())
        .then(data => {
            const transactionCards = document.getElementById('stocktransaction-cards');
            transactionCards.innerHTML = ''; // Kosongkan card sebelumnya

            data.forEach(stocktransaction => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
            <h4>${stocktransaction.id_barang}</h4>
            <p>Jumlah: ${stocktransaction.jumlah}</p>
            <p>Jenis: ${stocktransaction.jenis_transaksi}</p>
            <p>Tanggal: ${new Date(stocktransaction.tanggal).toLocaleDateString()}</p>
          `;
                transactionCards.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching transactions:', error));
}

function populateStockDropdown() {
    const stockSelect = document.getElementById("item_name");

    if (!stockSelect) {
        console.error("Dropdown stock tidak ditemukan di DOM!");
        return;
    }

    // Ambil data pelanggan dari localStorage
    const storedStocks = localStorage.getItem("stockData");

    if (storedStocks) {
        const stocks = JSON.parse(storedStocks);
        console.log("Data stok dari localStorage:", stocks);

        // Reset dropdown sebelum mengisi ulang
        stockselect.innerHTML = `<option value="" disabled selected>Pilih Nama item</option>`;

        stocks.forEach(stock => {
            const option = document.createElement("option");
            option.value = stock.item_name;
            option.textContent = stock.item_name;
            stockselect.appendChild(option);
        });

        console.log("Dropdown stok berhasil diisi!");
    } else {
        console.warn("Data stok tidak ditemukan di localStorage.");
    }
}
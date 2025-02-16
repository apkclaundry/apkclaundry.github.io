// Fetch available items from the backend and populate the select dropdown
fetch('/api/items')
    .then(response => response.json())
    .then(data => {
        const itemSelect = document.getElementById('itemID');
        data.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.item_name;
            itemSelect.appendChild(option);
        });
    });

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

// Fungsi untuk menampilkan data stok
async function fetchStocksTransactions() {
    const token = getAuthToken();

    try {
        console.log("Fetching stocks transactions with token:", token);

        const response = await fetch("https://apkclaundry.vercel.app/stocktransaction", {
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

        const stockstransactions = await response.json();
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

    stockstransactions.forEach((stocktransaction) => {
        // **Tampilan Tabel (Desktop)**
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${stocktransaction.id_transaksi}</td>
            <td>${stocktransaction.id_barang}</td>
            <td>${new Date(stocktransaction.tanggal)}</td>
            <td>${stocktransaction.jenis_transaksi}</td>
            <td>${stocktransaction.jumlah}</td>
            <td>${stocktransaction.stok_setelah}</td>

            <td class="actions">
                <button class="edit" onclick="editStock('${stocktransaction.id_transaksi}')">&#9998;</button>
                <button class="delete" onclick="deleteStock('${stocktransaction.id_transaksi}')">&#128465;</button>
            </td>
        `;
        stocktransactionTableBody.appendChild(row);

        // **Tampilan Card (Mobile)**
        const listItem = document.createElement("div");
        listItem.classList.add("stocktransaction-item");
        listItem.dataset.id = stocktransaction.id_transaksi; // Menyimpan ID barang
        listItem.innerHTML = `
            <p><strong>ID Transaksi:</strong> ${stocktransaction.id_transaksi}</p>
            <p><strong>ID Barang:</strong> ${stocktransaction.id_barang}</p>
            <p><strong>Tanggal:</strong> ${new Date(stocktransaction.tanggal)}</p>
            <p><strong>Jenis Transaksi:</strong> ${stocktransaction.jenis_transaksi}</p>
            <p><strong>Jumlah:</strong> ${stocktransaction.jumlah}</p>
            <p><strong>Stok Setelah:</strong> ${stocktransaction.stok_setelah}</p>
            <div class="actions">
                <button class="edit" onclick="editStock('${stocktransaction.id_transaksi}')">Edit</button>
                <button class="delete" onclick="deleteStock('${stocktransaction.id_transaksi}')">Hapus</button>
            </div>
        `;
        stocktransactionList.appendChild(listItem);
    });
}

fetchStocksTransactions();



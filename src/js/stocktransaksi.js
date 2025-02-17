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
async function fetchitemsTransactions() {
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
        console.log("Fetching items transactions with token:", token);

        const response = await fetch("https://apkclaundry.vercel.app/item-transaction", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Response status:", response.status);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const itemstransactions = await response.json();
        if (!Array.isArray(itemstransactions)) {
            console.error("Data transaksi stok bukan array:", itemstransactions);
            return;
        }

        console.log("items transactions fetched:", itemstransactions);
        displayitemsTransactions(itemstransactions);
    } catch (error) {
        console.error("Error fetching items transactions:", error);
        Swal.fire({
            title: "Error!",
            text: "Gagal mengambil data transaksi stok.",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
}

// Fungsi untuk menampilkan data stok dalam tabel (Desktop) dan kartu (Mobile)
function displayitemsTransactions(itemstransactions) {
    const itemtransactionTableBody = document.querySelector("#itemtransaction-table tbody");
    const itemtransactionList = document.querySelector(".itemtransaction-list");

    if (!itemtransactionTableBody || !itemtransactionList) {
        console.error("Elemen tabel atau daftar stok tidak ditemukan di DOM.");
        return;
    }

    // Reset tabel dan daftar
    itemtransactionTableBody.innerHTML = "";
    itemtransactionList.innerHTML = "";

    if (itemstransactions.length === 0) {
        itemtransactionTableBody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Belum ada transaksi stok</td></tr>";
        itemtransactionList.innerHTML = "<p style='text-align: center;'>Belum ada transaksi stok</p>";
        return;
    }

    itemstransactions.forEach((itemtransaction) => {
        // **Tampilan Tabel (Desktop)**
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${itemtransaction.id_transaksi}</td>
            <td>${itemtransaction.item_id}</td>
            <td>${itemtransaction.item_name}</td>
            <td>${new Date(itemtransaction.date).toLocaleDateString()}</td>
            <td>${itemtransaction.transaction_type}</td>
            <td>${itemtransaction.quantity}</td>
            <td>${itemtransaction.stok_setelah}</td>
            
        `;
        itemtransactionTableBody.appendChild(row);

        // **Tampilan Card (Mobile)**
        const listItem = document.createElement("div");
        listItem.classList.add("itemtransaction-item");
        listItem.dataset.id = itemtransaction.id;
        listItem.innerHTML = `
            <p><strong>ID Transaksi:</strong> ${itemtransaction.id}</p>
            <p><strong>ID Barang:</strong> ${itemtransaction.item_id}</p>
            <p><strong>date:</strong> ${new Date(itemtransaction.date).toLocaleDateString()}</p>
            <p><strong>Jenis Transaksi:</strong> ${itemtransaction.transaction_type}</p>
            <p><strong>quantity:</strong> ${itemtransaction.quantity}</p>
            <p><strong>Stok Setelah:</strong> ${itemtransaction.stok_setelah}</p>
        `;
        itemtransactionList.appendChild(listItem);
    });
}

// Panggil fungsi saat halaman dimuat

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadCustomerData();
    populateCustomerDropdown();
    fetchItems();
    fetchitemsTransactions();
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
            item_id: itemId,
            quantity: parseInt(quantity),
            transaction_type: type  // Sesuaikan field nama
        })
    })
        .then(response => response.json())
        .then(_data => {
            alert('Transaksi berhasil disimpan');
            updateitemTransactionTable(); // Perbarui tabel stok
            updateitemTransactionCards(); // Perbarui kartu transaksi stok
        })
        .catch(error => console.error('Error saving item transaction:', error));
});



// Perbarui fungsi update stok transaksi
function updateitemTransactionTable() {
    fetch('https://apkclaundry.vercel.app/item-transaction')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('itemtransaction-table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Kosongkan tabel sebelumnya

            data.forEach(itemtransaction => {
                const row = tableBody.insertRow();
                row.innerHTML = `
            <td>${itemtransaction.id}</td>
            <td>${itemtransaction.item_id}</td>
            <td>${itemtransaction.item_name}</td>
            <td>${new Date(itemtransaction.date).toLocaleDateString()}</td>
            <td>${itemtransaction.transaction_type}</td>
            <td>${itemtransaction.quantity}</td>
            <td>${itemtransaction.stok_setelah}</td>
            <td class="actions">
                <button class="edit" onclick="edititem('${itemtransaction.id}')">&#9998;</button>
                <button class="delete" onclick="deleteitem('${itemtransaction.id}')">&#128465;</button>
            </td>
          `;
            });
        })
        .catch(error => console.error('Error fetching transactions:', error));
}



function populateitemDropdown() {
    const itemSelect = document.getElementById("item_name");

    if (!itemSelect) {
        console.error("Dropdown stok tidak ditemukan di DOM!");
        return;
    }

    // Ambil data pelanggan dari localStorage
    const storeditems = localStorage.getItem("itemData");

    if (storeditems) {
        const items = JSON.parse(storeditems);
        console.log("Data stok dari localStorage:", items);

        // Reset dropdown sebelum mengisi ulang
        itemselect.innerHTML = `<option value="" disabled selected>Pilih Nama item</option>`;

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.item_name;
            option.textContent = item.item_name;
            itemselect.appendChild(option);
        });

        console.log("Dropdown stok berhasil diisi!");
    } else {
        console.warn("Data stok tidak ditemukan di localStorage.");
    }
}
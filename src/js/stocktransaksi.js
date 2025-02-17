// Ambil elemen-elemen DOM
const itemDropdown = document.getElementById('item-name');
const transactionForm = document.getElementById('stockTransactionForm');
const transactionTableBody = document.querySelector('#transactionTable tbody');
const transactionCardsContainer = document.getElementById('stocktransaction-cards');

// Ambil data nama stok untuk dropdown
function fetchItemNames() {
  fetch('https://apkclaundry.vercel.app/item-name')
    .then(response => response.json())
    .then(data => {
      // Kosongkan dropdown sebelum mengisinya
      itemDropdown.innerHTML = '';

      // Isi dropdown dengan nama item
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = stock.item-name;
        option.textContent = stock.item-name;
        itemDropdown.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching item names:', error));
}

// Ambil dan tampilkan transaksi stok dalam tabel
function fetchItemTransactions() {
  fetch('https://apkclaundry.vercel.app/item-transaction')
    .then(response => response.json())
    .then(data => {
      // Kosongkan tabel
      transactionTableBody.innerHTML = '';
      transactionCardsContainer.innerHTML = '';

      // Isi tabel dengan data transaksi
      data.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${itemtransaction.item_name}</td>
          <td>${itemtransaction.quantity}</td>
          <td>${itemtransaction.transaction_type}</td>
          <td>${itemtransaction.date}</td>
        `;
        transactionTableBody.appendChild(row);

        // Tampilkan dalam bentuk kartu untuk mobile
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <h3>${itemtransaction.item_name}</h3>
          <p>Jumlah: ${itemtransaction.quantity}</p>
          <p>Jenis: ${itemtransaction.transaction_type}</p>
          <p>Tanggal: ${itemtransaction.date}</p>
        `;
        transactionCardsContainer.appendChild(card);
      });
    })
    .catch(error => console.error('Error fetching item transactions:', error));
}

// Fungsi untuk menangani pengiriman form transaksi baru
function handleTransactionFormSubmit(event) {
  event.preventDefault(); // Mencegah form submit default

  const itemName = itemDropdown.value;
  const transactionType = document.getElementById('transactionType').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const date = document.getElementById('date').value;

  // Validasi data
  if (!itemName || !quantity || !date) {
    alert('Semua field harus diisi!');
    return;
  }

  const newTransaction = {
    item_name: itemName,
    quantity: quantity,
    transaction_type: transactionType,
    date: date,
  };

  // Kirim data transaksi ke API
  fetch('https://apkclaundry.vercel.app/item-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTransaction),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message); // Menampilkan pesan sukses
      fetchItemTransactions(); // Update tabel dan kartu
      transactionForm.reset(); // Reset form
    })
    .catch(error => {
      console.error('Error creating transaction:', error);
      alert('Gagal membuat transaksi');
    });
}

// Inisialisasi halaman
function initializePage() {
  fetchItemNames(); // Ambil data stok untuk dropdown
  fetchItemTransactions(); // Ambil data transaksi dan tampilkan

  // Tambahkan event listener untuk form submit
  transactionForm.addEventListener('submit', handleTransactionFormSubmit);
}

// Jalankan fungsi inisialisasi saat halaman siap
document.addEventListener('DOMContentLoaded', initializePage);

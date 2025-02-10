function parseDate(dateString) {
  // Contoh format: "09/12/24, 10.05"
  const [datePart, timePart] = dateString.split(", ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("/").map(num => parseInt(num, 10));
  const fullYear = year < 50 ? 2000 + year : 1900 + year; // Untuk menangani tahun singkat (24 -> 2024)

  // Pisahkan waktu
  const [hours, minutes] = timePart.split(".").map(num => parseInt(num, 10));

  // Gunakan UTC untuk memastikan tidak ada perubahan waktu
  return new Date(Date.UTC(fullYear, month - 1, day, hours, minutes));
}


function loadTransactions() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  return orders.map(order => {
    const parsedDate = parseDate(order.date); // Parse tanggal
    const validDate = parsedDate && !isNaN(parsedDate.getTime()); // Validasi tanggal

    return {
      customer: order.name || "Tidak Diketahui",
      service: order.service || "Tidak Diketahui",
      date: validDate ? parsedDate.toISOString().split('T')[0] : "Tanggal Tidak Valid", // Gunakan ISO format
      amount: parseInt(order.totalPrice.replace(/[^\d]/g, ''), 10) || 0,
    };
  });
}

console.log("Parsed Transactions:", loadTransactions());


function filterTransactions(period) {
  const transactions = loadTransactions();
  const today = new Date();

  return transactions.filter(({ date }) => {
    const transactionDate = new Date(date);
    const diffInDays = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));

    if (period === "daily") return diffInDays === 0;
    if (period === "weekly") return diffInDays <= 7;
    if (period === "monthly") return diffInDays <= 30;
  });
}

function calculateTotals() {
  const daily = filterTransactions("daily").reduce((sum, { amount }) => sum + amount, 0);
  const weekly = filterTransactions("weekly").reduce((sum, { amount }) => sum + amount, 0);
  const monthly = filterTransactions("monthly").reduce((sum, { amount }) => sum + amount, 0);

  document.getElementById("dailyTotal").textContent = `Rp ${daily.toLocaleString("id-ID")}`;
  document.getElementById("weeklyTotal").textContent = `Rp ${weekly.toLocaleString("id-ID")}`;
  document.getElementById("monthlyTotal").textContent = `Rp ${monthly.toLocaleString("id-ID")}`;
}

function groupByCustomer(transactions) {
  const grouped = {};

  transactions.forEach(({ customer, service, date, amount }) => {
    if (!grouped[customer]) {
      grouped[customer] = {
        services: new Set(),
        totalAmount: 0,
        transactions: 0,
        lastDate: date,
      };
    }

    grouped[customer].services.add(service);
    grouped[customer].totalAmount += amount;
    grouped[customer].transactions += 1;
    grouped[customer].lastDate = date;
  });

  return Object.entries(grouped).map(([customer, { services, totalAmount, transactions, lastDate }]) => ({
    customer,
    service: Array.from(services).join(", "),
    date: lastDate,
    transactions,
    totalAmount,
  }));
}
function renderTable(period) {
  const filteredTransactions = filterTransactions(period).filter(({ date }) => date !== "Tanggal Tidak Valid");
  const groupedData = groupByCustomer(filteredTransactions);

  const tableBody = document.getElementById("revenueTableBody");
  tableBody.innerHTML = "";

  groupedData.forEach(({ customer, service, date, transactions, totalAmount }) => {
    const row = `
      <tr>
        <td>${customer}</td>
        <td>${service}</td>
        <td>${date}</td>
        <td>${transactions}</td>
        <td>Rp ${totalAmount.toLocaleString("id-ID")}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

//card
async function calculateTotals() {
  const transactions = await fetchTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset jam agar hanya menghitung tanggal

  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;

  transactions.forEach(({ date, amount }) => {
    // Konversi "10/02/2025" menjadi format Date yang valid
    const [day, month, year] = date.split("/").map(num => parseInt(num, 10));
    const transactionDate = new Date(year, month - 1, day);
    transactionDate.setHours(0, 0, 0, 0); // Reset jam agar perhitungan akurat

    // Hitung selisih hari
    const diffInDays = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));

    // Perbaiki logika perbandingan
    if (diffInDays === 0) {
      dailyTotal += amount; // Pendapatan hari ini
    }
    if (diffInDays >= 0 && diffInDays < 7) {
      weeklyTotal += amount; // Pendapatan 7 hari terakhir
    }
    if (diffInDays >= 0 && diffInDays < 30) {
      monthlyTotal += amount; // Pendapatan 30 hari terakhir
    }
  });

  // Tampilkan hasil di card
  document.getElementById("dailyTotal").textContent = `Rp ${dailyTotal.toLocaleString("id-ID")}`;
  document.getElementById("weeklyTotal").textContent = `Rp ${weeklyTotal.toLocaleString("id-ID")}`;
  document.getElementById("monthlyTotal").textContent = `Rp ${monthlyTotal.toLocaleString("id-ID")}`;
}

// Jalankan perhitungan setelah data diambil dari API
calculateTotals();

//merubah tabel berdasarkan dropdown
function updateTableHeaders(selectedOption) {
  const headers = {
    "Laundry": ["Nama Pelanggan", "Layanan", "Tanggal", "Jumlah Transaksi", "Total Pendapatan (Rp)"],
    "Gaji": ["Nama Karyawan", "Role", "Tanggal Rekrutmen", "Tanggal Gajian", "Gaji Bulan Ini", ],
  };

  const selectedHeaders = headers[selectedOption] || headers["Laundry"]; // Default ke Laundry jika tidak ditemukan
  const tableHeaderRow = document.querySelector("#revenueTableBody").closest("table").querySelector("thead tr");

  if (tableHeaderRow) {
    tableHeaderRow.innerHTML = `
      <th>${selectedHeaders[0]}</th>
      <th>${selectedHeaders[1]}</th>
      <th>${selectedHeaders[2]}</th>
      <th>${selectedHeaders[3]}</th>
      <th>${selectedHeaders[4]}</th>
    `;
  }
}


// Event Listener untuk perubahan dropdown
document.getElementById("filterPeriod").addEventListener("change", (event) => {
  updateTableHeaders(event.target.options[event.target.selectedIndex].text);
});

// Inisialisasi pertama kali
document.addEventListener("DOMContentLoaded", () => {
  updateTableHeaders(document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text);
});

//tabel dropdown laporan
async function fetchTransactions() {
  try {
    // Ambil token dari localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token tidak ditemukan, pastikan pengguna sudah login.");
      return [];
    }

    // Request ke API dengan Authorization Token
    const response = await fetch("https://apkclaundry.vercel.app/transaction", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Tambahkan token di sini
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data, status: ${response.status}`);
    }

    const transactions = await response.json();

    return transactions.map(transaction => ({
      customer: transaction.customer_name || "Tidak Diketahui",
      service: transaction.service_type || "Tidak Diketahui",
      date: transaction.transaction_date || "Tanggal Tidak Valid",
      amount: parseInt(transaction.total_price) || 0
    }));
  } catch (error) {
    console.error("Gagal mengambil data transaksi:", error);
    return [];
  }
}


async function groupTransactionsByCustomer() {
  const transactions = await fetchTransactions();
  const grouped = {};

  transactions.forEach(({ customer, service, date, amount }) => {
    if (!grouped[customer]) {
      grouped[customer] = {
        services: new Set(),
        totalAmount: 0,
        transactions: 0,
        lastDate: date
      };
    }

    grouped[customer].services.add(service);
    grouped[customer].totalAmount += amount;
    grouped[customer].transactions += 1;
    grouped[customer].lastDate = date;
  });

  return Object.entries(grouped).map(([customer, { services, totalAmount, transactions, lastDate }]) => ({
    customer,
    service: Array.from(services).join(", "),
    date: lastDate,
    transactions,
    totalAmount
  }));
}

async function renderTableLaundry() {
  const groupedData = await groupTransactionsByCustomer();
  const tableBody = document.getElementById("revenueTableBody");
  tableBody.innerHTML = "";

  groupedData.forEach(({ customer, service, date, transactions, totalAmount }) => {
    const row = `
      <tr>
        <td>${customer}</td>
        <td>${service}</td>
        <td>${date}</td>
        <td>${transactions}</td>
        <td>Rp ${totalAmount.toLocaleString("id-ID")}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

//tabel dropdown Gaji
async function fetchEmployeeSalaries() {
  try {
    // Ambil token dari localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token tidak ditemukan, pastikan pengguna sudah login.");
      return [];
    }

    // Request ke API Employee dengan Authorization Token
    const response = await fetch("https://apkclaundry.vercel.app/employee", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Tambahkan token di sini
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data, status: ${response.status}`);
    }

    const employees = await response.json();

    return employees.map(employee => ({
      username: employee.username || "Tidak Diketahui",
      role: employee.role || "Tidak Diketahui",
      hired_date: employee.hired_date || "Tanggal Tidak Valid",
      salary_date: employee.salary_date || "Tanggal Tidak Valid",
      salary: parseInt(employee.salary) || 0
    }));
  } catch (error) {
    console.error("Gagal mengambil data gaji:", error);
    return [];
  }
}

async function renderTableSalary() {
  const salaries = await fetchEmployeeSalaries();
  const tableBody = document.getElementById("revenueTableBody");
  tableBody.innerHTML = "";

  salaries.forEach(({ username, role, hired_date, salary_date, salary }) => {
    const row = `
      <tr>
        <td>${username}</td>
        <td>${role}</td>
        <td>${hired_date}</td>
        <td>${salary_date}</td>
        <td>Rp ${salary.toLocaleString("id-ID")}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Event Listener untuk Dropdown
document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  if (selectedValue === "Gaji") {
    await renderTableSalary();
  } else if (selectedValue === "Laundry") {
    await renderTableLaundry(); // Memastikan Laundry tetap berfungsi
  }
});

// Inisialisasi pertama kali
document.addEventListener("DOMContentLoaded", () => {
  const defaultOption = document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text;
  if (defaultOption === "Gaji") {
    renderTableSalary();
  } else {
    renderTableLaundry();
  }
});

//hilangkan card ketika dropdown tabel Gaji di pilih
function toggleCardsVisibility(selectedOption) {
  const cardsContainer = document.querySelector(".row.mb-5"); // Ambil container card
  
  if (selectedOption === "Gaji") {
    cardsContainer.style.display = "none"; // Sembunyikan jika pilih Gaji
  } else {
    cardsContainer.style.display = "flex"; // Tampilkan jika pilih Laundry atau lainnya
  }
}

// Update event listener dropdown untuk menyembunyikan card
document.getElementById("filterPeriod").addEventListener("change", (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  toggleCardsVisibility(selectedValue);
});

// Inisialisasi pertama kali saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  const defaultOption = document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text;
  toggleCardsVisibility(defaultOption);
});


// Event Listener untuk Dropdown
document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.value;
  if (selectedValue === "daily") {
    await renderTableLaundry();
  }
});

// Inisialisasi pertama kali
renderTableLaundry();



document.getElementById("filterPeriod").addEventListener("change", (event) => {
  renderTable(event.target.value);
});

// Inisialisasi
calculateTotals();
renderTable("daily");

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
// Merubah tabel berdasarkan dropdown
function updateTableHeaders(selectedOption) {
  const headers = {
    "Laundry": ["Nama Pelanggan", "Layanan", "Tanggal", "Jumlah Transaksi", "Total Pendapatan (Rp)"],
    "Gaji": ["Nama Karyawan", "Role", "Tanggal Rekrutmen", "Tanggal Gajian", "Gaji Bulan Ini", ],
    "Supplier": ["Nama Supplier", "Email", "Produk yang Disuplai", "Total Pembelian Terakhir", "Tanggal Transaksi Terakhir"]
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
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token tidak ditemukan, pastikan pengguna sudah login.");
      return [];
    }

    // Cek apakah data gaji sudah ada di LocalStorage dan masih valid (cache 10 menit)
    const cachedData = localStorage.getItem("employeeSalaries");
    const cacheTime = localStorage.getItem("employeeSalariesTime");

    if (cachedData && cacheTime) {
      const now = new Date().getTime();
      if (now - parseInt(cacheTime) < 10 * 60 * 1000) { // Cache berlaku 10 menit
        console.log("Menggunakan data gaji dari LocalStorage");
        return JSON.parse(cachedData);
      }
    }

    // Jika tidak ada cache atau cache sudah kadaluarsa, ambil dari API
    console.log("Mengambil data gaji dari API...");
    const response = await fetch("https://apkclaundry.vercel.app/employee", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data, status: ${response.status}`);
    }

    const employees = await response.json();

    const salaries = employees.map(employee => ({
      username: employee.username || "Tidak Diketahui",
      role: employee.role || "Tidak Diketahui",
      hired_date: employee.hired_date || "Tanggal Tidak Valid",
      salary_date: employee.salary_date || "Tanggal Tidak Valid",
      salary: parseInt(employee.salary) || 0
    }));

    // Simpan ke LocalStorage
    localStorage.setItem("employeeSalaries", JSON.stringify(salaries));
    localStorage.setItem("employeeSalariesTime", new Date().getTime().toString());

    return salaries;
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

  renderMobileList(salaries, "Gaji");  // Menyesuaikan tampilan mobile
  toggleMobileView("Gaji");  // Pastikan tampilan mobile diperbarui
}
//tombol detail gaji
document.getElementById("filterPeriod").addEventListener("change", (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  const viewSalaryButton = document.getElementById("viewSalaryData");

  if (selectedValue === "Gaji") {
    viewSalaryButton.style.display = "inline-block"; // Tampilkan tombol
  } else {
    viewSalaryButton.style.display = "none"; // Sembunyikan tombol
  }
});

//ambil data gaji
document.getElementById("viewSalaryData").addEventListener("click", async () => {
  const currentYear = new Date().getFullYear(); // Tahun saat ini (2025)
  let yearOptions = "";
  
  for (let i = 0; i < 5; i++) { // Tambahkan 5 tahun terakhir (2025 - 2021)
    yearOptions += `<option value="${currentYear - i}">${currentYear - i}</option>`;
  }

  const { value: formValues } = await Swal.fire({
    title: "Pilih Bulan dan Tahun",
    html: `
      <select id="selectMonth" class="swal2-select">
        <option value="01">Januari</option>
        <option value="02">Februari</option>
        <option value="03">Maret</option>
        <option value="04">April</option>
        <option value="05">Mei</option>
        <option value="06">Juni</option>
        <option value="07">Juli</option>
        <option value="08">Agustus</option>
        <option value="09">September</option>
        <option value="10">Oktober</option>
        <option value="11">November</option>
        <option value="12">Desember</option>
      </select>
      <select id="selectYear" class="swal2-select">${yearOptions}</select>
    `,
    focusConfirm: false,
    preConfirm: () => {
      return {
        month: document.getElementById("selectMonth").value,
        year: document.getElementById("selectYear").value,
      };
    },
  });

  if (!formValues || !formValues.month || !formValues.year) {
    Swal.fire("Batal", "Anda harus memilih bulan dan tahun!", "warning");
    return;
  }

  const selectedMonth = formValues.month;
  const selectedYear = formValues.year;

  // Ambil token dari LocalStorage
  const token = localStorage.getItem("authToken");
  if (!token) {
    Swal.fire("Unauthorized", "Token tidak ditemukan. Silakan login kembali.", "error");
    return;
  }

  // Ambil data dari API dengan token
  try {
    const response = await fetch("https://apkclaundry.vercel.app/employee-salary", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Tambahkan token ke header
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data, status: ${response.status}`);
    }

    const salaries = await response.json();

    // Filter berdasarkan bulan dan tahun yang dipilih
    const filteredSalaries = salaries.filter(salary => {
      const [day, month, year] = salary.salary_date.split("/"); // Format "DD/MM/YYYY"
      return month === selectedMonth && year === selectedYear;
    });

    if (filteredSalaries.length === 0) {
      Swal.fire("Tidak Ada Data", `Tidak ada data gaji untuk ${selectedMonth}/${selectedYear}`, "info");
      return;
    }

    // Tampilkan hasil dalam popup
    let salaryHTML = `
      <table class="swal2-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal Gaji</th>
            <th>Gaji (Rp)</th>
          </tr>
        </thead>
        <tbody>
    `;
    filteredSalaries.forEach(({ id, salary_date, salary }) => {
      salaryHTML += `
        <tr>
          <td>${id}</td>
          <td>${salary_date}</td>
          <td>Rp ${salary.toLocaleString("id-ID")}</td>
        </tr>
      `;
    });

    salaryHTML += `</tbody></table>`;

    Swal.fire({
      title: `Data Gaji Bulan ${selectedMonth}/${selectedYear}`,
      html: salaryHTML,
      width: "600px",
      confirmButtonText: "Tutup",
    });

  } catch (error) {
    console.error("Gagal mengambil data:", error);
    Swal.fire("Error", "Gagal mengambil data dari server! Pastikan Anda memiliki akses.", "error");
  }
});

// Event Listener untuk Dropdown
document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  if (selectedValue === "Gaji") {
    await renderTableSalary();
  } else {
    await renderTableLaundry();
  }

  toggleMobileView(selectedValue);
});


// Pastikan toggle berjalan setelah data dimuat
document.addEventListener("DOMContentLoaded", () => {
  const defaultOption = document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text;
  toggleMobileView(defaultOption);
});

// Pastikan juga dropdown bekerja saat berubah
document.getElementById("filterPeriod").addEventListener("change", (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  toggleMobileView(selectedValue);
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
  const supplierCard = document.querySelector(".card.bg-danger"); // Ambil card total supplier
  const otherCards = document.querySelectorAll(".row.mb-5 .card:not(.bg-danger)"); // Ambil card selain total supplier
  
  if (selectedOption === "Gaji") {
    cardsContainer.style.display = "none"; // Sembunyikan jika pilih Gaji
  } else if (selectedOption === "Supplier") {
    cardsContainer.style.display = "flex"; // Tampilkan container card
    supplierCard.style.display = "block"; // Tampilkan card total supplier
    otherCards.forEach(card => card.style.display = "none"); // Sembunyikan card lain
  } else {
    cardsContainer.style.display = "flex"; // Tampilkan container card
    supplierCard.style.display = "none"; // Sembunyikan card total supplier
    otherCards.forEach(card => card.style.display = "block"); // Tampilkan card lain
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

//mobile table version
// Fungsi untuk menampilkan/menghilangkan list atau tabel berdasarkan ukuran layar
function toggleMobileView(selectedOption) {
  const tableContainer = document.querySelector(".table-container");
  const mobileList = document.querySelector(".mobile-list");

  if (!tableContainer || !mobileList) {
    console.error("Element table-container atau mobile-list tidak ditemukan.");
    return;
  }

  if (window.innerWidth <= 768) {
    tableContainer.style.display = "none"; // Sembunyikan tabel di mobile
    mobileList.style.display = "block"; // Tampilkan list/card
  } else {
    tableContainer.style.display = "block"; // Tampilkan tabel di desktop
    mobileList.style.display = "none"; // Sembunyikan list/card di desktop
  }
}

// Fungsi untuk membuat tampilan mobile dalam format list/card
function renderMobileList(data, type) {
  const mobileListContainer = document.getElementById("mobileReportList");
  mobileListContainer.innerHTML = ""; // Kosongkan kontainer sebelum isi ulang

  if (type === "Laundry") {
    data.forEach(({ customer, service, date, transactions, totalAmount }) => {
      const card = `
        <div class="card mb-2 p-3 shadow-sm">
          <p><strong>Nama Pelanggan:</strong> ${customer}</p>
          <p><strong>Layanan:</strong> ${service}</p>
          <p><strong>Tanggal:</strong> ${date}</p>
          <p><strong>Jumlah Transaksi:</strong> ${transactions}</p>
          <p><strong>Total Pendapatan:</strong> Rp ${totalAmount.toLocaleString("id-ID")}</p>
        </div>
      `;
      mobileListContainer.innerHTML += card;
    });
  } else if (type === "Gaji") {
    data.forEach(({ username, role, hired_date, salary_date, salary }) => {
      const card = `
        <div class="card mb-2 p-3 shadow-sm">
          <p><strong>Nama Karyawan:</strong> ${username}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Tanggal Rekrutmen:</strong> ${hired_date}</p>
          <p><strong>Tanggal Gajian:</strong> ${salary_date}</p>
          <p><strong>Gaji Bulan Ini:</strong> Rp ${salary.toLocaleString("id-ID")}</p>
        </div>
      `;
      mobileListContainer.innerHTML += card;
    });
  } else if (type === "Supplier") {
    data.forEach(({ supplier_name, email, supplied_products, total_amount, date }) => {
      const card = `
        <div class="card mb-2 p-3 shadow-sm">
          <p><strong>Nama Supplier:</strong> ${supplier_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Produk yang Disuplai:</strong> ${supplied_products}</p>
          <p><strong>Total Pembelian Terakhir:</strong> Rp ${total_amount.toLocaleString("id-ID")}</p>
          <p><strong>Tanggal Transaksi Terakhir:</strong> ${date}</p>
        </div>
      `;
      mobileListContainer.innerHTML += card;
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  fetchSupplierData();
  fetchEmployeeSalaries();
});


// Modifikasi renderTable agar memanggil renderMobileList()
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

  renderMobileList(groupedData, "Laundry");
  toggleMobileView("Laundry"); // Pastikan tampilan mobile diperbarui
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

  renderMobileList(salaries, "Gaji");
  toggleMobileView("Gaji"); // Pastikan tampilan mobile diperbarui
}

// Pastikan fungsi ini dipanggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  const defaultOption = document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text;
  toggleMobileView(defaultOption);
});

// Event Listener untuk menangani dropdown perubahan data
document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;
  if (selectedValue === "Gaji") {
    await renderTableSalary();
  } else {
    await renderTableLaundry();
  }
  toggleMobileView(selectedValue);
});

// Perbaiki renderTable agar juga memanggil renderMobileList()





document.getElementById("filterPeriod").addEventListener("change", (event) => {
  renderTable(event.target.value);
});

// Inisialisasi
calculateTotals();
renderTable("daily");

//Supplier Laporan
async function fetchSupplierData() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    Swal.fire("Error", "Token tidak ditemukan, silakan login kembali.", "error");
    return [];
  }

  try {
    const response = await fetch("https://apkclaundry.vercel.app/supplier", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Gagal mengambil data supplier");

    const supplierData = await response.json();
    console.log("Data supplier dari API:", supplierData);

    return supplierData.map((supplier) => {
      const latestTransaction = supplier.transactions?.[0] || {}; // Ambil transaksi terbaru (index 0)
      
      return {
        supplier_name: supplier.supplier_name || "Tidak tersedia",
        email: supplier.email || "Tidak tersedia",
        supplied_products: supplier.supplied_products?.join(", ") || "Tidak tersedia",
        total_amount: latestTransaction.total_amount || 0,
        date: latestTransaction.date ? new Date(latestTransaction.date).toLocaleDateString("id-ID") : "Tidak tersedia",
      };
    });
  } catch (error) {
    console.error("Error fetching supplier data:", error);
    Swal.fire("Error", "Gagal mengambil data supplier.", "error");
    return [];
  }
}

async function renderTableSupplier() {
  const suppliers = await fetchSupplierData();
  const tableBody = document.getElementById("revenueTableBody");
  tableBody.innerHTML = "";

  suppliers.forEach(({ supplier_name, email, supplied_products, total_amount, date }) => {
    const row = `
      <tr>
        <td>${supplier_name}</td>
        <td>${email}</td>
        <td>${supplied_products}</td>
        <td>Rp ${total_amount.toLocaleString("id-ID")}</td>
        <td>${date}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  renderMobileList(suppliers, "Supplier");
  toggleMobileView("Supplier");
}

async function calculateSupplierExpenditure() {
  const suppliers = await fetchSupplierData();
  const totalExpenditure = suppliers.reduce((sum, { total_amount }) => sum + total_amount, 0);
  document.getElementById("supplierTotal").textContent = `Rp ${totalExpenditure.toLocaleString("id-ID")}`;
}

document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.value;
  if (selectedValue === "monthly") {
    await renderTableSupplier();
  }
});


document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;

  if (selectedValue === "Supplier") {
    await renderTableSupplier();
    await calculateSupplierExpenditure();
  } else if (selectedValue === "Gaji") {
    await renderTableSalary();
  } else {
    await renderTableLaundry();
  }

  toggleMobileView(selectedValue);
});

document.getElementById("filterPeriod").addEventListener("change", async (event) => {
  const selectedValue = event.target.options[event.target.selectedIndex].text;

  if (selectedValue === "Supplier") {
    await renderTableSupplier();
    await calculateSupplierExpenditure();
  } else if (selectedValue === "Laundry") {
    await renderTableLaundry();
  } else {
    await renderTableSalary();
  }

  toggleMobileView(selectedValue);
});


document.addEventListener("DOMContentLoaded", () => {
  const defaultOption = document.getElementById("filterPeriod").options[document.getElementById("filterPeriod").selectedIndex].text;
  if (defaultOption === "Supplier") {
    renderTableSupplier();
    calculateSupplierExpenditure();
  } else if (defaultOption === "Gaji") {
    renderTableSalary();
  } else {
    renderTableLaundry();
  }
  toggleMobileView(defaultOption);
});

renderTableSupplier();

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



document.getElementById("filterPeriod").addEventListener("change", (event) => {
  renderTable(event.target.value);
});

// Inisialisasi
calculateTotals();
renderTable("daily");

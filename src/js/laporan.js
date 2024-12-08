const dummyData = [
    { customer: "Ani", service: "Cuci", date: "2024-12-06", amount: 50000 },
    { customer: "Budi", service: "Setrika", date: "2024-12-06", amount: 70000 },
    { customer: "Citra", service: "Cuci & Setrika", date: "2024-12-05", amount: 40000 },
    { customer: "Dedi", service: "Cuci", date: "2024-12-01", amount: 90000 },
    { customer: "Ani", service: "Setrika", date: "2024-11-30", amount: 30000 },
    { customer: "Budi", service: "Cuci & Setrika", date: "2024-11-29", amount: 80000 },
  ];  
  
  if (!localStorage.getItem("transactions")) {
    localStorage.setItem("transactions", JSON.stringify(dummyData));
  }
  
  
  function loadTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  }
  
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
      // Cek apakah service sudah ada
      console.log(`Processing transaction for: ${customer}, Service: ${service}`);
      
      if (!grouped[customer]) {
        grouped[customer] = {
          services: new Set(),
          totalAmount: 0,
          transactions: 0,
          lastDate: date,
        };
      }
  
      if (service) {
        grouped[customer].services.add(service);  // Tambahkan layanan ke Set
      } else {
        console.error(`Service is undefined for customer: ${customer}`);
      }
  
      grouped[customer].totalAmount += amount;
      grouped[customer].transactions += 1;
      grouped[customer].lastDate = date;
    });
  
    return Object.entries(grouped).map(([customer, { services, totalAmount, transactions, lastDate }]) => ({
      customer,
      service: Array.from(services).join(", "),  // Gabungkan layanan menjadi string
      date: lastDate,
      transactions,
      totalAmount,
    }));
  }
  

  
  
  
  function renderTable(period) {
    const filteredTransactions = filterTransactions(period);
    const groupedData = groupByCustomer(filteredTransactions);
  
    const tableBody = document.getElementById("revenueTableBody");
    tableBody.innerHTML = "";
  
    groupedData.forEach(({ customer, service, date, transactions, totalAmount }) => {
        console.log(`Rendering Row: ${customer}, ${service}, ${date}, ${transactions}, ${totalAmount}`);
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
  
  calculateTotals();
  renderTable("daily");
  
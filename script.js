const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income-amount");
const expenseEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const formEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const dateEl = document.getElementById("date");
const searchEl = document.getElementById("search");
const filterCategoryEl = document.getElementById("filter-category");
const exportBtn = document.getElementById("export-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
transactions = transactions.map(t => ({ ...t, amount: Number(t.amount) }));

// Auto-fill today's date in the form placeholder
dateEl.valueAsDate = new Date();

formEl.addEventListener("submit", e => {
  e.preventDefault();
  const transaction = {
    id: Date.now(),
    description: descriptionEl.value,
    amount: parseFloat(amountEl.value),
    category: categoryEl.value,
    date: dateEl.value || new Date().toISOString().split("T")[0] // placeholder if missing
  };
  transactions.push(transaction);
  saveAndRender();
  formEl.reset();
  dateEl.valueAsDate = new Date(); // reset placeholder
});

searchEl.addEventListener("input", renderTransactions);
filterCategoryEl.addEventListener("change", renderTransactions);

exportBtn.addEventListener("click", () => {
  const header = ["ID","Description","Amount","Category","Date"];
  const rows = transactions.map(t => [
    t.id,
    t.description,
    t.amount,
    t.category,
    t.date ? t.date : "N/A" // placeholder for missing dates
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download","transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
}

function renderTransactions(){
  const searchText = searchEl.value.toLowerCase();
  const selectedCategory = filterCategoryEl.value;

  transactionListEl.innerHTML = "";

  transactions
    .filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchText);
      const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a,b) => b.id - a.id)
    .forEach(t => {
      const li = document.createElement("li");
      li.className = `transaction ${t.amount>0?"income":"expense"}`;
      li.innerHTML = `
        <span>${t.description} 
          <span class="category-badge" style="background:${getCategoryColor(t.category)}">${t.category}</span>
          - ${t.date || "N/A"}
        </span>
        <span>${formatCurrency(t.amount)}
          <button class="delete-btn" onclick="deleteTransaction(${t.id})">x</button>
        </span>
      `;
      transactionListEl.appendChild(li);
      setTimeout(()=>li.classList.add("show"),50);
    });
}

window.deleteTransaction = function(id){
  transactions = transactions.filter(t => t.id !== id);
  saveAndRender();
}

function updateSummary(){
  const income = transactions.filter(t => t.amount>0).reduce((a,b)=>a+b.amount,0);
  const expense = transactions.filter(t => t.amount<0).reduce((a,b)=>a+b.amount,0);
  balanceEl.textContent = formatCurrency(income + expense);
  incomeEl.textContent = formatCurrency(income);
  expenseEl.textContent = formatCurrency(expense);
}

function formatCurrency(num){
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(num);
}

function getCategoryColor(category){
  const colors = { "Food":"#f87171","Entertainment":"#fbbf24","Bills":"#60a5fa","Salary":"#34d399","Other":"#a78bfa" };
  return colors[category] || "#ccc";
}

saveAndRender();

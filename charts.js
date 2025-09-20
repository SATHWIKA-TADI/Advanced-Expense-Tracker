document.addEventListener("DOMContentLoaded", () => {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions = transactions.map(t=> ({...t, amount: Number(t.amount)}));

  const ctx1 = document.getElementById("expenseChart").getContext("2d");
  const ctx2 = document.getElementById("incomeExpenseChart").getContext("2d");
  const filterCategoryEl = document.getElementById("filter-category");
  const fromDateEl = document.getElementById("from-date");
  const toDateEl = document.getElementById("to-date");
  const updateBtn = document.getElementById("update-btn");

  let expenseChart, incomeExpenseChart;

  function renderCharts() {
    let filtered = transactions;

    // Filter by category
    const cat = filterCategoryEl.value;
    if(cat !== "all") filtered = filtered.filter(t => t.category === cat);

    // Filter by date
    const from = fromDateEl.value;
    const to = toDateEl.value;
    if(from) filtered = filtered.filter(t => t.date >= from);
    if(to) filtered = filtered.filter(t => t.date <= to);

    const categories = ["Food","Entertainment","Bills","Salary","Other"];
    const expenseData = categories.map(c => filtered.filter(t => t.category===c && t.amount<0).reduce((a,b)=>a+b.amount,0)*-1);
    const income = filtered.filter(t=>t.amount>0).reduce((a,b)=>a+b.amount,0);
    const totalExpenses = filtered.filter(t=>t.amount<0).reduce((a,b)=>a+b.amount,0)*-1;

    if(expenseChart) expenseChart.destroy();
    if(incomeExpenseChart) incomeExpenseChart.destroy();

    expenseChart = new Chart(ctx1,{ type:"pie", data:{ labels:categories, datasets:[{ data:expenseData, backgroundColor:["#f87171","#fbbf24","#60a5fa","#34d399","#a78bfa"] }] } });
    incomeExpenseChart = new Chart(ctx2,{ type:"bar", data:{ labels:["Income","Expenses"], datasets:[{ label:"Amount", data:[income,totalExpenses], backgroundColor:["#34d399","#f87171"] }] }, options:{ scales:{ y:{ beginAtZero:true } } } });
  }

  updateBtn.addEventListener("click", renderCharts);
  renderCharts();
});

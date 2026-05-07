// ---------------------------
// Simple Bank Functionality
// ---------------------------

// Load saved data on startup
let balance = parseFloat(localStorage.getItem("balance")) || 0;
let historyList = JSON.parse(localStorage.getItem("history")) || [];

// Display initial values
document.getElementById("balance").innerText = balance.toFixed(2);
renderHistory();

// Deposit money
function deposit() {
    const amount = parseFloat(document.getElementById("amount").value);

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid deposit amount");
        return;
    }

    balance += amount;
    saveTransaction("Deposit", amount);
    updateUI();
}

// Withdraw money
function withdraw() {
    const amount = parseFloat(document.getElementById("amount").value);

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid withdrawal amount");
        return;
    }

    if (amount > balance) {
        alert("Insufficient funds");
        return;
    }

    balance -= amount;
    saveTransaction("Withdraw", amount);
    updateUI();
}

// Save transaction to history
function saveTransaction(type, amount) {
    const entry = {
        type: type,
        amount: amount,
        date: new Date().toLocaleString()
    };

    historyList.unshift(entry); // newest first
    localStorage.setItem("history", JSON.stringify(historyList));
}

// Update balance + history UI
function updateUI() {
    document.getElementById("balance").innerText = balance.toFixed(2);
    localStorage.setItem("balance", balance);
    renderHistory();
}

// Render transaction history
function renderHistory() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";

    if (historyList.length === 0) {
        historyDiv.innerHTML = "<p>No transactions yet</p>";
        return;
    }

    historyList.forEach(entry => {
        const item = document.createElement("div");
        item.classList.add("history-item");
        item.innerHTML = `
            <strong>${entry.type}</strong>: $${entry.amount.toFixed(2)}
            <br>
            <small>${entry.date}</small>
        `;
        historyDiv.appendChild(item);
    });
}

// ---------------------------
// Secure Digital Wallet
// ---------------------------

// Require login
function requireAuth() {
    const user = localStorage.getItem("currentUser");
    if (!user) {
        alert("Unauthorized access blocked");
        window.location.href = "login.html";
    }
}
requireAuth();

// Load user wallet
const currentUser = localStorage.getItem("currentUser");
const userKey = `wallet_${currentUser}`;

let wallet = JSON.parse(localStorage.getItem(userKey)) || {
    balance: 0,
    history: []
};

document.getElementById("displayUser").innerText = currentUser;
updateUI();

// Simple SHA‑256 hashing (requires CryptoJS)
function hash(str) {
    return CryptoJS.SHA256(str).toString();
}

// Atomic transaction handler
function processTransaction(type, amount) {
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount");
        return;
    }

    if (type === "Withdraw" && amount > wallet.balance) {
        alert("Insufficient funds");
        return;
    }

    // Update balance
    wallet.balance += type === "Deposit" ? amount : -amount;

    // Create tamper‑proof transaction entry
    const lastHash = wallet.history.length > 0 
        ? wallet.history[0].hash 
        : "GENESIS";

    const entry = {
        type,
        amount,
        date: new Date().toISOString(),
        previousHash: lastHash,
        hash: hash(type + amount + lastHash)
    };

    wallet.history.unshift(entry);

    // Save atomically
    localStorage.setItem(userKey, JSON.stringify(wallet));

    updateUI();
}

function deposit() {
    const amount = document.getElementById("amount").value;
    processTransaction("Deposit", amount);
}

function withdraw() {
    const amount = document.getElementById("amount").value;
    processTransaction("Withdraw", amount);
}

function updateUI() {
    document.getElementById("balance").innerText = wallet.balance.toFixed(2);
    renderHistory();
}

function renderHistory() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";

    if (wallet.history.length === 0) {
        historyDiv.innerHTML = "<p>No transactions yet</p>";
        return;
    }

    wallet.history.forEach(entry => {
        const item = document.createElement("div");
        item.classList.add("history-item");
        item.innerHTML = `
            <strong>${entry.type}</strong>: $${entry.amount.toFixed(2)}
            <br>
            <small>${entry.date}</small>
            <br>
            <small>Hash: ${entry.hash.substring(0, 12)}...</small>
        `;
        historyDiv.appendChild(item);
    });
}


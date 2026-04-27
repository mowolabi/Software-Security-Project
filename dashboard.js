const userData = {
    username: "User",
    bank: "Bulldog",
    network: "VISA",
    cardNumber: "**** **** **** ****",
    cardHolder: "Name",
    expiry: "MM/YY",
    balance: "$0.00",
    accountNumber: "****",
    routingNumber: "****",
    accountType: "Checking"
};

document.getElementById("username").textContent = userData.username;
document.getElementById("bank").textContent = userData.bank;
document.getElementById("network").textContent = userData.network;
document.getElementById("cardNumber").textContent = userData.cardNumber;
document.getElementById("cardHolder").textContent = userData.cardHolder;
document.getElementById("expiry").textContent = userData.expiry;
document.getElementById("balance").textContent = userData.balance;
document.getElementById("accountNumber").textContent = userData.accountNumber;
document.getElementById("routingNumber").textContent = userData.routingNumber;
document.getElementById("accountType").textContent = userData.accountType;
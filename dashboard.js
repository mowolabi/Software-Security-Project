let users = JSON.parse(localStorage.getItem("users")) || [];
const currentUsername = localStorage.getItem("currentUser");
let currentUser = users.find(user => user.username === currentUsername);

if(!currentUser){
  window.location.href = "index.html";
}

if(!currentUser.achievements){
  currentUser.achievements = [];
}

if(!currentUser.history){
  currentUser.history = [];
}

if(!currentUser.cardNumber){
  currentUser.cardNumber = createCardNumber();
}

if(!currentUser.cardExpiration){
  currentUser.cardExpiration = createExpirationDate();
}

if(!currentUser.cvv){
  currentUser.cvv = createCVV();
}

let cardNumberVisible = false;
let cvvVisible = false;

const usernameEl = document.getElementById("username");
const cardHolderEl = document.getElementById("cardHolder");
const cardNumberEl = document.getElementById("cardNumber");
const cardExpirationEl = document.getElementById("cardExpiration");
const cvvNumberEl = document.getElementById("cvvNumber");
const toggleCardBtn = document.getElementById("toggleCardBtn");
const toggleCvvBtn = document.getElementById("toggleCvvBtn");
const accountNumberEl = document.getElementById("accountNumber");
const balanceEl = document.getElementById("balance");
const amountEl = document.getElementById("amount");
const transferUsernameEl = document.getElementById("transferUsername");
const historyEl = document.getElementById("history");
const walletAddressEl = document.getElementById("walletAddress");
const achievementsEl = document.getElementById("achievements");
const toastEl = document.getElementById("toast");
const bankCard = document.getElementById("bankCard");

const allAchievements = [
  { id:"firstDeposit", icon:"💰", title:"First Deposit", rule:function(){ return currentUser.history.some(item => item.type === "Deposit"); } },
  { id:"firstWithdraw", icon:"💸", title:"First Withdraw", rule:function(){ return currentUser.history.some(item => item.type === "Withdraw"); } },
  { id:"firstTransfer", icon:"🚀", title:"First Transfer", rule:function(){ return currentUser.history.some(item => item.type === "Transfer Sent" || item.type === "Transfer Received"); } },
  { id:"hundredClub", icon:"🔥", title:"$100 Club", rule:function(){ return Number(currentUser.balance) >= 100; } },
  { id:"thousandClub", icon:"🏆", title:"$1000 Club", rule:function(){ return Number(currentUser.balance) >= 1000; } },
  { id:"walletConnected", icon:"🦊", title:"Wallet Connected", rule:function(){ return currentUser.wallet !== ""; } },
  { id:"fiveTransactions", icon:"⭐", title:"5 Transactions", rule:function(){ return currentUser.history.length >= 5; } }
];

function createCardNumber(){
  let cardNumber = "600942";
  for(let i = 0; i < 10; i++){
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function createExpirationDate(){
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = String(today.getFullYear() + 4).slice(-2);
  return month + "/" + year;
}

function createCVV(){
  return String(Math.floor(100 + Math.random() * 900));
}

function formatCardNumber(number){
  return String(number).replace(/(.{4})/g, " ").trim();
}

function maskCardNumber(number){
  const lastFour = String(number).slice(-4);
  return "**** **** **** " + lastFour;
}

function saveUsers(){
  localStorage.setItem("users", JSON.stringify(users));
}

function saveCurrentUser(){
  users = users.map(user => user.username === currentUser.username ? currentUser : user);
  saveUsers();
}

function showToast(message){
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(function(){
    toastEl.classList.remove("show");
  }, 2500);
}

function checkAchievements(){
  allAchievements.forEach(function(achievement){
    const alreadyUnlocked = currentUser.achievements.includes(achievement.id);
    if(!alreadyUnlocked && achievement.rule()){
      currentUser.achievements.push(achievement.id);
      showToast("Achievement unlocked: " + achievement.icon + " " + achievement.title);
    }
  });
  saveCurrentUser();
}

function renderAchievements(){
  achievementsEl.innerHTML = "";
  allAchievements.forEach(function(achievement){
    const unlocked = currentUser.achievements.includes(achievement.id);
    const div = document.createElement("div");
    div.className = unlocked ? "badge unlocked" : "badge";
    div.textContent = achievement.icon + " " + achievement.title;
    achievementsEl.appendChild(div);
  });
}

function updateDashboard(){
  usernameEl.textContent = currentUser.name;
  cardHolderEl.textContent = currentUser.name;
  cardNumberEl.textContent = cardNumberVisible ? formatCardNumber(currentUser.cardNumber) : maskCardNumber(currentUser.cardNumber);
  cvvNumberEl.textContent = cvvVisible ? currentUser.cvv : "***";
  toggleCardBtn.textContent = cardNumberVisible ? "Hide Card Number" : "Show Card Number";
  toggleCvvBtn.textContent = cvvVisible ? "Hide CVV" : "Show CVV";
  cardExpirationEl.textContent = currentUser.cardExpiration;
  accountNumberEl.textContent = "****" + String(currentUser.cardNumber).slice(-4);
  balanceEl.textContent = "$" + Number(currentUser.balance).toFixed(2);
  walletAddressEl.textContent = currentUser.wallet || "Not connected";
  renderAchievements();
  historyEl.innerHTML = "";

  if(currentUser.history.length === 0){
    historyEl.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  currentUser.history.slice().reverse().forEach(function(item){
    const div = document.createElement("div");
    const cssType = item.type.toLowerCase().includes("transfer") ? "transfer" : item.type.toLowerCase();
    const note = item.note ? " <small>" + item.note + "</small>" : "";
    div.className = "history-item";
    div.innerHTML = `
      <span>${item.type}${note}</span>
      <strong class="${cssType}">${item.sign}$${Number(item.amount).toFixed(2)}</strong>
    `;
    historyEl.appendChild(div);
  });
}

function getAmount(){
  const amount = parseFloat(amountEl.value);
  if(isNaN(amount) || amount <= 0){
    alert("Enter a valid amount.");
    return null;
  }
  return amount;
}

function deposit(){
  const amount = getAmount();
  if(amount === null) return;

  currentUser.balance = Number(currentUser.balance) + amount;
  currentUser.history.push({ type:"Deposit", amount, sign:"+" });
  amountEl.value = "";
  checkAchievements();
  saveCurrentUser();
  updateDashboard();
}

function withdraw(){
  const amount = getAmount();
  if(amount === null) return;

  if(amount > Number(currentUser.balance)){
    alert("Not enough money.");
    return;
  }

  currentUser.balance = Number(currentUser.balance) - amount;
  currentUser.history.push({ type:"Withdraw", amount, sign:"-" });
  amountEl.value = "";
  checkAchievements();
  saveCurrentUser();
  updateDashboard();
}

function transfer(){
  const amount = getAmount();
  if(amount === null) return;

  const recipientUsername = transferUsernameEl.value.trim();
  if(recipientUsername === ""){
    alert("Enter the username you want to transfer to.");
    return;
  }

  if(recipientUsername === currentUser.username){
    alert("You cannot transfer money to yourself.");
    return;
  }

  if(amount > Number(currentUser.balance)){
    alert("Not enough money to transfer.");
    return;
  }

  const recipientIndex = users.findIndex(user => user.username === recipientUsername);
  if(recipientIndex === -1){
    alert("No user found with that username.");
    return;
  }

  currentUser.balance = Number(currentUser.balance) - amount;
  currentUser.history.push({ type:"Transfer Sent", amount, sign:"-", note:"to " + recipientUsername });

  users[recipientIndex].balance = Number(users[recipientIndex].balance) + amount;
  if(!users[recipientIndex].history){
    users[recipientIndex].history = [];
  }
  users[recipientIndex].history.push({ type:"Transfer Received", amount, sign:"+", note:"from " + currentUser.username });

  amountEl.value = "";
  transferUsernameEl.value = "";
  checkAchievements();
  saveCurrentUser();
  saveUsers();
  updateDashboard();
  showToast("Transfer sent to " + recipientUsername + ".");
}

async function connectMetaMask(){
  if(typeof window.ethereum === "undefined"){
    alert("MetaMask is not installed. Install the extension first.");
    return;
  }

  try{
    const accounts = await window.ethereum.request({ method:"eth_requestAccounts" });
    currentUser.wallet = accounts[0];
    checkAchievements();
    saveCurrentUser();
    updateDashboard();
  }catch(error){
    alert("MetaMask connection was rejected.");
  }
}

bankCard.addEventListener("click", function(){
  bankCard.classList.toggle("flipped");
});

function toggleCardNumber(e){
  e.stopPropagation();
  cardNumberVisible = !cardNumberVisible;
  updateDashboard();
}

function toggleCvv(e){
  e.stopPropagation();
  cvvVisible = !cvvVisible;
  updateDashboard();
}

toggleCardBtn.addEventListener("click", toggleCardNumber);
toggleCvvBtn.addEventListener("click", toggleCvv);

document.getElementById("depositBtn").addEventListener("click", deposit);
document.getElementById("withdrawBtn").addEventListener("click", withdraw);
document.getElementById("transferBtn").addEventListener("click", transfer);
document.getElementById("connectWalletBtn").addEventListener("click", connectMetaMask);
document.getElementById("logoutBtn").addEventListener("click", function(){
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
});

checkAchievements();
saveCurrentUser();
updateDashboard();

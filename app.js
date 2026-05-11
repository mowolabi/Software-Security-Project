const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const resetForm = document.getElementById("resetForm");
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const resetMessage = document.getElementById("resetMessage");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");

function clearMessages(){
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  resetMessage.textContent = "";
}

function showOnly(form){
  loginForm.classList.remove("active");
  signupForm.classList.remove("active");
  resetForm.classList.remove("active");
  form.classList.add("active");
}

function showLogin(){
  clearMessages();
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  showOnly(loginForm);
}

function showSignup(){
  clearMessages();
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  showOnly(signupForm);
}

function showReset(){
  clearMessages();
  loginTab.classList.remove("active");
  signupTab.classList.remove("active");
  showOnly(resetForm);
}

function getUsers(){
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);
forgotPasswordBtn.addEventListener("click", showReset);
backToLoginBtn.addEventListener("click", showLogin);

signupForm.addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const users = getUsers();

  if(users.some(user => user.username.toLowerCase() === username.toLowerCase())){
    signupMessage.textContent = "Username already exists.";
    signupMessage.className = "message error";
    return;
  }

  users.push({
    name,
    username,
    password,
    balance:0,
    wallet:"",
    history:[],
    achievements:[]
  });

  saveUsers(users);
  signupMessage.textContent = "Account created. Now login.";
  signupMessage.className = "message success";
  signupForm.reset();
  showLogin();
  loginMessage.textContent = "Account created. Now login.";
  loginMessage.className = "message success";
});

loginForm.addEventListener("submit", function(e){
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const users = getUsers();
  const user = users.find(user => user.username === username && user.password === password);

  if(!user){
    loginMessage.textContent = "Wrong username or password.";
    loginMessage.className = "message error";
    return;
  }

  localStorage.setItem("currentUser", user.username);
  window.location.href = "dashboard.html";
});

resetForm.addEventListener("submit", function(e){
  e.preventDefault();

  const username = document.getElementById("resetUsername").value.trim();
  const newPassword = document.getElementById("resetPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const users = getUsers();
  const userIndex = users.findIndex(user => user.username === username);

  if(userIndex === -1){
    resetMessage.textContent = "No account found with that username.";
    resetMessage.className = "message error";
    return;
  }

  if(newPassword.length < 4){
    resetMessage.textContent = "Password must be at least 4 characters.";
    resetMessage.className = "message error";
    return;
  }

  if(newPassword !== confirmPassword){
    resetMessage.textContent = "Passwords do not match.";
    resetMessage.className = "message error";
    return;
  }

  users[userIndex].password = newPassword;
  saveUsers(users);
  resetForm.reset();
  showLogin();
  loginMessage.textContent = "Password updated. You can login now.";
  loginMessage.className = "message success";
});

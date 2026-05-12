import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJ8mF1TVKyfyG6dLZge5QYyTDxIFkYvgs",
  authDomain: "os-security-dce20.firebaseapp.com",
  projectId: "os-security-dce20",
  storageBucket: "os-security-dce20.firebasestorage.app",
  messagingSenderId: "1010357444718",
  appId: "1:1010357444718:web:f0990bbb0dada5a6bb867f",
  measurementId: "G-F6LKENFCT3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let recaptchaVerifier;

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

function cleanPhoneNumber(phone){
  const cleaned = phone.replace(/\s|\(|\)|-/g, "");

  if(cleaned.startsWith("+")){
    return cleaned;
  }

  if(cleaned.length === 10){
    return "+1" + cleaned;
  }

  return cleaned;
}


function isValidPassword(password){
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= 6 &&
    hasUppercase &&
    hasNumber &&
    hasSymbol
  );
}

function setupRecaptcha(){
  if(recaptchaVerifier){
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size:"normal",
      callback:function(){
        loginMessage.textContent = "reCAPTCHA verified. You can login now.";
        loginMessage.className = "message success";
      }
    }
  );

  return recaptchaVerifier;
}

loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);
forgotPasswordBtn.addEventListener("click", showReset);
backToLoginBtn.addEventListener("click", showLogin);

signupForm.addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const phone = cleanPhoneNumber(document.getElementById("signupPhone").value.trim());
  const password = document.getElementById("signupPassword").value;
  const users = getUsers();

  if(users.some(user => user.username.toLowerCase() === username.toLowerCase())){
    signupMessage.textContent = "Username already exists.";
    signupMessage.className = "message error";
    return;
  }

  if(!isValidPassword(password)){
    signupMessage.textContent = "Password must be at least 6 characters and include a capital letter, number, and symbol.";
    signupMessage.className = "message error";
    return;
  }

  if(!phone.startsWith("+") || phone.length < 10){
    signupMessage.textContent = "Use a real phone number with country code, like +13015551234.";
    signupMessage.className = "message error";
    return;
  }

  users.push({
    name,
    username,
    phone,
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
  loginMessage.textContent = "Account created. Complete the reCAPTCHA, then login.";
  loginMessage.className = "message success";
});

loginForm.addEventListener("submit", async function(e){
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

  if(!user.phone){
    loginMessage.textContent = "This account does not have a phone number saved. Create a new account with a phone number.";
    loginMessage.className = "message error";
    return;
  }

  try{
    loginMessage.textContent = "Sending verification code...";
    loginMessage.className = "message";

    const appVerifier = setupRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(auth, user.phone, appVerifier);
    const code = prompt("Enter the verification code sent to " + user.phone);

    if(!code){
      loginMessage.textContent = "Verification cancelled.";
      loginMessage.className = "message error";
      return;
    }

    await confirmationResult.confirm(code);

    localStorage.setItem("currentUser", user.username);
    window.location.href = "dashboard.html";
  }catch(error){
    console.error(error);
    loginMessage.textContent = "Phone verification failed. Make sure Phone Auth is enabled and your domain is authorized in Firebase.";
    loginMessage.className = "message error";

    if(recaptchaVerifier){
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
      document.getElementById("recaptcha-container").innerHTML = "";
    }
  }
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

  if(!isValidPassword(newPassword)){
    resetMessage.textContent = "Password must be at least 6 characters and include a capital letter, number, and symbol.";
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

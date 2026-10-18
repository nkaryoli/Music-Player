const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginError = document.querySelector("#login-error");

const DEMO_USER = {
  email: "demo@music.com",
  password: "123456",
};

const redirectToPlayer = () => {
  window.location.href = "./src/pages/player.html";
};

if (sessionStorage.getItem("music_user")) {
  redirectToPlayer();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const isValidUser = email === DEMO_USER.email && password === DEMO_USER.password;

  if (!isValidUser) {
    loginError.classList.remove("hidden");
    return;
  }

  sessionStorage.setItem("music_user", JSON.stringify({ email }));

  redirectToPlayer();
});

const currentUser = sessionStorage.getItem("music_user");

if (!currentUser) {
  window.location.href = "../../index.html";
}

const logoutButton = document.querySelector("#logout-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("music_user");
    window.location.href = "../../index.html";
  });
}
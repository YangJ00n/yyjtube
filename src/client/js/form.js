const form = document.querySelector("form");
const btn = form.querySelector("input[type=submit]");

form.addEventListener("submit", () => (btn.disabled = true));

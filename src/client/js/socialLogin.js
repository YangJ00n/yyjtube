const socialLogin = document.getElementById("socialLogin");

const handleSocialLogin = () => {
  const a = socialLogin.querySelector("a");
  const href = a.href;
  // 여러번 누르는 경우 생기는 오류 방지
  if (href) {
    a.removeAttribute("href");
    a.innerText = "Logging in now...";
    window.location = href;
  }
};

socialLogin.addEventListener("click", handleSocialLogin);

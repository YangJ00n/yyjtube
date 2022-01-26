import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";

  // 비밀번호와 비밀번호 확인이 일치하는지 확인
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  // username 또는 email이 존재하는지 확인
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

  // 사용자 생성
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });

  // 존재하는 사용자인지 확인
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  // 비밀번호가 일치하는지 확인
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }

  // session에 정보 추가
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// Github Login
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  // code를 access_token으로 바꿈
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    // access_token을 가지고 Github API를 이용해서 유저의 정보를 가져옴
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);

    // email이 private일 경우도 있기 때문에 access_token을 가지고 Github API를 이용해서 이메일 가져옴
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    // primary와 verified가 true인 이메일이 있는지 확인
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      // DB에 해당 email을 가진 사용자가 없을 경우 -> Join
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : userData.login,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }

    // session에 정보 추가
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) =>
  res.render("edit-profile", { pageTitle: "Edit Profile" });
export const postEdit = async (req, res) => {
  // const id = req.session.user.id;
  // const { name, email, username, location } = req.body;
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  // console.log(file);

  // username과 email을 다른 사용자가 사용하고 있는지 확인 (my code ⬇️)
  const pageTitle = "Edit Profile";
  const findUsername = await User.findOne({ username });
  if (findUsername._id != _id) {
    return res.render("edit-profile", {
      pageTitle,
      errorMessage: `${username} is an existing username.`,
    });
  }
  const findEmail = await User.findOne({ email });
  if (findEmail._id != _id) {
    return res.render("edit-profile", {
      pageTitle,
      errorMessage: `${email} is an existing email.`,
    });
  }

  // 사용자 정보 업데이트
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  // session에 정보 업데이트
  req.session.user = updatedUser;

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  // social 로그인한 경우에는 접근 불가
  if (req.session.user.socialOnly) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const pageTitle = "Change Password";
  const user = await User.findById(_id);

  // 현재 비밀번호가 DB에 있는 비밀번호와 일치하는지 확인
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The current password is incorrect.",
    });
  }

  // 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The password doex not match the confirmation.",
    });
  }

  // 비밀번호 변경
  user.password = newPassword;
  await user.save(); // pre save가 작동됨

  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  // populate("videos") -> videos의 ObjectId를 실제 데이터로 변환한다.
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};

import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  // pug파일에서 res.locas에 접근할 수 있다.
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

// 로그인 되어 있으면 통과하는 middleware
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

// 로그인 되어 있지 않으면 통과하는 middleware
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

// form에서 파일을 받아서 지정한 폴더에 저장하고 다음 controller에게 파일에 대한 정보(req.file)를 넘겨주는 middleware
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3145728, // 3MB // 파일 최대 사이즈 설정 (단위 Byte)
  },
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 31457280, // 30MB
  },
});

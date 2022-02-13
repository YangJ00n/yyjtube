import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "yyjtube/images",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "yyjtube/videos",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

export const localsMiddleware = (req, res, next) => {
  // pug파일에서 res.locas에 접근할 수 있다.
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "YYJtube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isHeroku = isHeroku;
  next();
};

// 로그인 되어 있으면 통과하는 middleware
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Log in first.");
    return res.redirect("../login");
  }
};

// 로그인 되어 있지 않으면 통과하는 middleware
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Authorized");
    return res.redirect("/");
  }
};

// form에서 파일을 받아서 지정한 폴더에 저장하고 다음 controller에게 파일에 대한 정보(req.file)를 넘겨주는 middleware
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 6291456, // 6MB // 파일 최대 사이즈 설정 (단위 Byte)
  },
  storage: isHeroku ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 62914560, // 60MB
  },
  storage: isHeroku ? s3VideoUploader : undefined,
});

export const s3DeleteFile = (req, res, next) => {
  if (!req.file) return next();

  s3.deleteObject({
    Bucket: "yyjtube",
    Key: `${req.session.user.avatarUrl.split(".com/")[1]}`,
  });
  next();
};

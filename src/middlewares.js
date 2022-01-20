export const localsMiddleware = (req, res, next) => {
  // pug파일에서 res.locas에 접근할 수 있다.
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user;
  next();
};

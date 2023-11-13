function roleCheck(req, res, next) {
  console.log(req.user);
  console.log(req.body);
  console.log(req.params);
  next();
}

export default roleCheck;

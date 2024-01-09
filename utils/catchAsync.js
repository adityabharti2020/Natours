module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //it will redirect to the next middleware that is error controller
  };
}
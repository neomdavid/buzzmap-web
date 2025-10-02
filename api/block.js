module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(404).send("Not Found");
};

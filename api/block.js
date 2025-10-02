export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
}

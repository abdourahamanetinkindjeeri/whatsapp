const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const server = jsonServer.create();
const dbPath = path.join(__dirname, "db.json");



// Vérifier si le fichier db.json existe
if (!fs.existsSync(dbPath)) {
  console.error(`Error: db.json not found at ${dbPath}`);
  process.exit(1);
}

console.log(`Using database file at: ${dbPath}`);

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

// Enable CORS
server.use(cors());

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(jsonServer.bodyParser);

// Use default router
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Database file path: ${dbPath}`);
  console.log("Available routes:");
  console.log("- /contacts");
  console.log("- /groups");
  console.log("- /users");
});

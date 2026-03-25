// src/server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 SmartShop API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs at  http://localhost:${PORT}/api-docs\n`);
});

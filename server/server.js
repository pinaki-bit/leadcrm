
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lead-crm';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection failed:', error.message));

app.use('/api/leads', require('./routes/leadRoutes'));

const productionArg = process.argv.includes('--production');
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const PORT = portArg ? Number(portArg.split('=')[1]) : Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === 'production' || productionArg;
console.log('NODE_ENV:', process.env.NODE_ENV, 'productionArg:', productionArg, 'isProduction:', isProduction);

if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.get('/', (req, res) => {
  if (isProduction) {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    res.send({ status: 'Lead CRM backend is running' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

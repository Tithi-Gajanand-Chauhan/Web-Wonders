const dns = require('dns');
// Force IPv4 for all outbound DNS resolutions.
// Without this, Node resolves to AAAA (IPv6) records first, and on some
// Windows networks the IPv6 path to api.themoviedb.org gets WSAECONNABORTED.
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const moviesRouter = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);

app.get('/', (req, res) => {
  res.json({ message: 'CineCircle API is running' });
});

// Global error handler — prevents uncaught ECONNRESET / stream errors
// from crashing the Express process on Windows.
app.use((err, req, res, next) => {
  console.error('[Express error handler]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  // ECONNRESET / WSAECONNABORTED are recoverable socket errors — log but don't exit
  if (['ECONNRESET', 'ECONNABORTED', 'EPIPE'].includes(err.code)) {
    console.warn(`[uncaughtException – recoverable] ${err.code}: ${err.message}`);
  } else {
    console.error('[uncaughtException – fatal]', err);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
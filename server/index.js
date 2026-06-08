const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));

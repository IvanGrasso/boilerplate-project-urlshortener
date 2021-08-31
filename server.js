require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// support parsing of application/json type post data
app.use(bodyParser.json());

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  res.json({
    original_url: req.body.url})
})

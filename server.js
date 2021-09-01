require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

// Set up database
mongoose.connect(process.env['DB_URI']);

const ShortURL = mongoose.model('ShortURL', {
  id: Number,
  originalURL: String
});

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Mount POST requests body parser
app.use(bodyParser.urlencoded({ extended: false }));

// support parsing of application/json type post data
app.use(bodyParser.json());

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', async function (req, res) {
  try {
   await ShortURL.findOne({ id: req.params.id }).then(shortURL => {
      if (!shortURL) {
        throw new Error("No short URL found for the given input");
      }
      res.redirect(shortURL.originalURL)
    })
  } catch (e) {
    res.json({ error: e.message })
  }
});

app.post('/api/shorturl', (req, res) => {
  let url = new URL(req.body.url)
  let domain = url.hostname.replace('www.', '')
  dns.lookup(domain, function(err, addresses) {
    if (err) {
      res.json({ error: "Invalid Hostname" })
    } else if (addresses[0] != undefined) {
      let count = ShortURL.countDocuments({}, function(err, docCount) {
        if (err) { return handleError(err) }       
        const shortURL = new ShortURL({
        id: docCount + 1,
        originalURL: req.body.url
      });
        shortURL.save(function(err) {
          if (err) { return handleError(err) }
          res.json({
            original_url: shortURL.originalURL,
            short_url: shortURL.id
          })
        });
      })
    }
  });
})

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
mongoose.connect(process.env['DB_URI']).then(() => {
  console.log("Connected to database")
}).catch((err) => {
  console.log("Database connection error: ", err);
})

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

app.post('/api/shorturl', async (req, res) => {
  try {
    let shortURL = await ShortURL.findOne({ originalURL: req.body.url})
    if (!shortURL) {
      let url = new URL(req.body.url)
      let domain = url.hostname.replace('www.', '')
      await lookupDNS(domain)
      let docCount = await ShortURL.countDocuments()
      shortURL = new ShortURL({
        id: docCount + 1,
        originalURL: req.body.url
      });
      await shortURL.save()
    }
    res.json({
      original_url: shortURL.originalURL,
      short_url: shortURL.id
    })
  } catch (e) {
    res.json({ error: e.message })
  }
})

async function lookupDNS(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) {
        reject(err);
      }
      resolve(address);
    });
  });
}

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

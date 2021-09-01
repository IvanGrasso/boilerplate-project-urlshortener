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
mongoose.connect('mongodb+srv://kenyano:bTr0eBXN5V4rMqx2@cluster0.r9bwx.mongodb.net/url_shortener?retryWrites=true&w=majority');

const ShortenedURL = mongoose.model('ShortenedURL', {
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

app.get('/api/shorturl/:id', function (req, res) {
  ShortenedURL.findOne({ id: req.params.id }, function (err, shortenedURL) {
    if (err) { return handleError(err) }
    if (shortenedURL == null) {
      res.json({
        error: "No short URL found for the given input"
      })
    } else {
      res.redirect(shortenedURL.originalURL);
    }
  });
});

app.post('/api/shorturl', (req, res) => {
  console.log(req.body)
  let url = new URL(req.body.url)
  let domain = url.hostname.replace('www.', '')
  dns.lookup(domain, function(err, addresses) {
    if (err) {
      res.json({ error: "Invalid Hostname" })
    } else if (addresses[0] != undefined) {
      let count = ShortenedURL.countDocuments({}, function(err, docCount) {
        if (err) { return handleError(err) }       
        const shortenedURL = new ShortenedURL({
        id: docCount + 1,
        originalURL: req.body.url
      });
        shortenedURL.save(function(err) {
          if (err) { return handleError(err) }
          res.json({
            original_url: shortenedURL.originalURL,
            short_url: shortenedURL.id
          })
        });
      })
    }
  });
})

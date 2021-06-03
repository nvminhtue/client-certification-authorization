const express = require('express');
const fs = require('fs');
const https = require('https');
const passport = require('passport');
const Strategy = require('passport-strategy');
const util = require('util')
const { exec } = require('child_process')

function ClientCertStrategy(options, verify = {}) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('Client cert authentication strategy requires a verify function');

  Strategy.call(this);
  this.name = 'client-cert';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(ClientCertStrategy, Strategy);

ClientCertStrategy.prototype.authenticate = function (req, options) {
  var that = this;

  if (!req.socket.authorized) {
    that.fail();
  } else {
    var clientCert = req.socket.getPeerCertificate();

    // The cert must exist and be non-empty
    if (!clientCert || Object.getOwnPropertyNames(clientCert).length === 0) {
      that.fail();
    } else {

      var verified = function verified(err, user) {
        if (err) { return that.error(err); }
        if (!user) { return that.fail(); }
        that.success(user);
      };

      if (this._passReqToCallback) {
        this._verify(req, clientCert, verified);
      } else {
        this._verify(clientCert, verified);
      }
    }
  }
};

const opts = {
  key: fs.readFileSync('ssl/server_key.pem'),
  cert: fs.readFileSync('ssl/server_cert.pem'),
  requestCert: true,
  rejectUnauthorized: false,
  ca: [fs.readFileSync('ssl/server_cert.pem')]
}

function lookupUser(cn, done) {
  var user = users.indexOf(cn) >= 0 ? { username: cn } : null;
  done(null, user);
}

var users = ['HasCert'];

function authenticate(cert, done) {
  var subject = cert.subject;
  var msg = 'Attempting PKI authentication';

  if (!subject) {
    console.log(msg + ' ✘ - no subject'.red);
    done(null, false);
  } else if (!subject.CN) {
    console.log(msg + '✘ - no client CN'.red);
    done(null, false);
  } else {
    var cn = subject.CN;

    lookupUser(cn, function (err, user) {
      msg = 'Authenticating ' + cn + ' with certificate';

      if (!user) {
        console.log(msg + ' ✘ - no such user'.red);
        done(null, false);
      } else {
        console.log(msg + ' - ✔'.green);
        done(null, user);
      }
    });
  }
}

const app = express()

passport.use(new ClientCertStrategy(authenticate))

app.use(passport.initialize())
app.use(passport.authenticate('client-cert', { session: false }))

app.get('/', (req, res) => {
  res.send('<a href="cert">CERT</>')
})

app.get('/cert', (req, res) => {
  const cert = req.socket.getPeerCertificate();

  if (req.client.authorized && cert.subject) {
    res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}`)
  } else if (cert.subject) {
    res.status(403).send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`)
  } else {
    res.status(401)
      .send(`Sorry, but you need to provide a client certificate to continue.`)
  }
})

app.get('/another', (req, res) => {
  res.send('TEST')
})

// app.post('/generate', (req, res) => { 
//   const certCode = `${Date.now()}`;
//   const certName = `${(req.body.name || 'Nguyen Viet Minh Tue').split(' ').join('_')}`;
//   const servertCert = '$PWD/ssl/server_cert.pem';
//   const servertKey = '$PWD/ssl/server_key.pem';
//   try {
//     exec(
//       `$PWD/generate_cert.sh ${certCode} ${certName} ${servertCert} ${servertKey} ${password}`,
//       (error, stdout, stderr) => {
//         console.log(stdout);
//         console.log(stderr);
//         if (error !== null) {
//           console.log(`exec error: ${error}`);
//         }
//       },
//     );
//   } catch (e) {
//     console.log(e);
//   }
//   res.send(`${certCode} has been succesfully generated`);
// })

https.createServer(opts, app).listen(9999)

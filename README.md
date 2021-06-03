# Client Certificate Authorization

:rocket: Theory: 
[title](https://www.jscape.com/blog/client-certificate-authentication)


## Step by step

:recycle: `sudo chmod +x generate_cert.sh generate_server_cert.sh`

- [x] `./generate_server_cert.sh`
- [x] `yarn`
- [x] `yarn start` or `yarn start:debug`
- [x] `$PWD/generate_cert.sh ${certCode} ${certName} ${servertCert} ${servertKey} $- {password}`,
- [x] Add certification with .p12 extension to browser/phone/pc
- [x] Go to https://localhost:9999
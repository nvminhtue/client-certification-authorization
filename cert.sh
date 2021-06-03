openssl req -x509 -newkey rsa:4096 -keyout server_key.pem -out server_cert.pem -nodes -days 365 -subj "/CN=localhost/O=Client\Certificate\ Demo"
#Create a new 4096bit RSA key and save it to server_key.pem, without DES encryption (-newkey, -keyout and -nodes)
#Create a Certificate Signing Request for a given subject, valid for 365 days (-days, -subj)
#Sign the CSR (Certificate signing request) using the server key, and save it to server_cert.pem as an X.509 certificate (-x509, -out)
#CN: Common name, O: Organization

openssl req -newkey rsa:4096 -keyout has.pem -out has_csr.pem -nodes -days 365 -subj "/CN=HasCert"
#create key and csr for HasCert organization

openssl x509 -req -in has_csr.pem -CA server_cert.pem -CAkey server_key.pem -out has.pem -set_serial 01 -days 365
#sign has's CSR with server key and save as a cert, supply server's cert and key via -CA param.

openssl pkcs12 -export -clcerts -in has_cert.pem -inkey has.pem -out has.p12
#bundle into PKCS#12 format (.p12)
#--clcerts option excludes CA cert from bundle because we issued the cert (already have one).
#set password for using import.
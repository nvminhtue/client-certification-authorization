openssl req -newkey rsa:4096 -keyout ssl/$1.pem -out ssl/$1_csr.pem -nodes -days 100 -subj "/CN=$2"
#create key and csr for HasCert organization

openssl x509 -req -in ssl/$1_csr.pem -CA $3 -CAkey $4 -out ssl/$1_cert.pem -set_serial 01 -days 100
#sign has's CSR with server key and save as a cert, supply server's cert and key via -CA param.

openssl pkcs12 -export -clcerts -in ssl/$1_cert.pem -inkey ssl/$1.pem -out ssl/$1.p12 -password pass:$5
#bundle into PKCS#12 format (.p12)
#--clcerts option excludes CA cert from bundle because we issued the cert (already have one).
#set password for using import.

#$1: company_gen_code $2: CertificateName #$3: server_cert dir #$4: server_key dir #$5: password #$6: expired days
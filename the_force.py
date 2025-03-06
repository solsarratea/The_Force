from http.server import SimpleHTTPRequestHandler, HTTPServer
import ssl
import os

HOST = 'localhost'
PORT = 4443
CERT_FILE = 'server+5.pem'  # Your mkcert certificate
KEY_FILE = 'server+5-key.pem'  # Your mkcert private key

# Check if cert and key files exist
if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
    raise FileNotFoundError(f"SSL certificate or key not found. Please generate them using mkcert.")

# Create HTTP server
httpd = HTTPServer((HOST, PORT), SimpleHTTPRequestHandler)

# Create SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)

# Wrap socket using SSL context
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving HTTPS on {HOST}:{PORT}")
httpd.serve_forever()

from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

httpd = HTTPServer(('localhost', 4443), SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile="../scripts/key.pem",
                               certfile='../scripts/cert.pem', server_side=True)

httpd.serve_forever()
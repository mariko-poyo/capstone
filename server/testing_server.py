#!/usr/bin/env/ python3

import socket
import random
import threading

HOST='127.0.0.1'
PORT=5000

def handle_client_connection(conn):
	print('connected by', addr)
	while True:
		rcv = conn.recv(1024)
		if rcv:
			r = random.randint(0, 1000)
			conn.send(str(r))
	conn.close()


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen(10)

while True:
	conn, addr = s.accept()
	print(conn, addr)
	client_handler = threading.Thread(target=handle_client_connection, args=(conn,))
	client_handler.start()
	
s.close()

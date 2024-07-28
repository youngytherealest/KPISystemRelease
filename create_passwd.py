from hashlib import sha3_256

passwd = input("Type password: ")
print(sha3_256(bytes(passwd, 'utf-8')).hexdigest())
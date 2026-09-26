import sys

from argon2 import PasswordHasher

if len(sys.argv) != 2:
    sys.exit("uso: python -m app.hash_senha '<senha>'")
print(PasswordHasher().hash(sys.argv[1]))

import zlib

def encode6bit(b):
    if b < 10:
        return chr(48 + b)
    b -= 10
    if b < 26:
        return chr(65 + b)
    b -= 26
    if b < 26:
        return chr(97 + b)
    b -= 26
    if b == 0:
        return '-'
    if b == 1:
        return '_'
    return '?'

def append3bytes(b1, b2, b3):
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    r = ""
    r += encode6bit(c1 & 0x3F)
    r += encode6bit(c2 & 0x3F)
    r += encode6bit(c3 & 0x3F)
    r += encode6bit(c4 & 0x3F)
    return r

def encode64(data):
    r = ""
    for i in range(0, len(data), 3):
        if i+2 == len(data):
            r += append3bytes(data[i], data[i+1], 0)
        elif i+1 == len(data):
            r += append3bytes(data[i], 0, 0)
        else:
            r += append3bytes(data[i], data[i+1], data[i+2])
    return r

def compress_and_encode(s):
    # UTF-8エンコーディング
    utf8_encoded = s.encode('utf-8')

    # デフレートアルゴリズムで圧縮
    compressed = zlib.compress(utf8_encoded)[2:-4]

    # Base64エンコーディングでASCIIにエンコード
    ascii_encoded = encode64(compressed)

    return "http://www.plantuml.com/plantuml/png/" + ascii_encoded
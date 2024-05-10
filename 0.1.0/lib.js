function createClassDiagram(obj) {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">`;

    let gap = 100;
    let rectHeight = 50;
    let positions = {};

    for (let i = 0; i < obj.allStrings.length; i++) {
        let text = obj.allStrings[i];
        let rectWidth = text.length * 10 + 50; // テキストの長さに合わせて調整

        let x = (obj.graph === 'LR') ? (i + 1) * gap : 400;
        let y = (obj.graph === 'TD') ? (i + 1) * gap : 300;

        // 複数のノードに接続しているノードを検出し、それらのノードを横に並べる
        let connectedNodes = obj.children.filter(edge => edge.start === text || edge.end === text);
        if (connectedNodes.length > 1) {
            x = 200 * (i % 2 + 1);
        }

        positions[text] = { x, y, rectWidth, rectHeight };

        svg += `<rect x="${x - rectWidth / 2}" y="${y - rectHeight / 2}" width="${rectWidth}" height="${rectHeight}" stroke="black" stroke-width="3" fill="white" />`;
        svg += `<text x="${x}" y="${y}" text-anchor="middle" dy=".3em">${text}</text>`;
    }

    for (let edge of obj.children) {
        let start = positions[edge.start];
        let end = positions[edge.end];

        let path = `M ${start.x} ${start.y + start.rectHeight / 2} C ${start.x} ${end.y}, ${end.x} ${start.y}, ${end.x} ${end.y - end.rectHeight / 2}`;

        svg += `<path d="${path}" stroke="black" stroke-width="2" fill="transparent" marker-end="url(#arrow)" />`;
    }

    svg += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>`;

    svg += `</svg>`;
    return svg;
}



function classp(str) {
    obj = { children: [] };
    for (var i = 0; i < str.length; i++) {
        input = str[i].replace(/^\s+/, '');
        if (input.startsWith('graph')) {
            let parts = input.split(/\s+/);
            let graphType = parts[1] === 'TD' || parts[1] === 'LR' ? parts[1] : 'Unknown';
            obj.graph = graphType;
        }
        if (input.includes('-->')) {
            let parts = input.split('-->');
            for (let i = 0; i < parts.length - 1; i++) {
                let start = parts[i].trim();
                let end = parts[i + 1].trim();

                obj.children = [...obj.children, { start, end }]
            }
        }
    }

    let allStrings = [...new Set(obj.children.flatMap(({ start, end }) => [start, end]))];

    svg = createClassDiagram({ ...obj, allStrings });

    return svg;
}

function encode64(data) {
    if (typeof data !== 'string') {
        throw new Error('Invalid input: encode64 expects a string');
    }

    let r = "";
    for (let i = 0; i < data.length; i += 3) {
        if (i + 2 == data.length) {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
        } else if (i + 1 == data.length) {
            r += append3bytes(data.charCodeAt(i), 0, 0);
        } else {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1),
                data.charCodeAt(i + 2));
        }
    }
    return r;
}

function append3bytes(b1, b2, b3) {
    c1 = b1 >> 2;
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    c4 = b3 & 0x3F;
    r = "";
    r += encode6bit(c1 & 0x3F);
    r += encode6bit(c2 & 0x3F);
    r += encode6bit(c3 & 0x3F);
    r += encode6bit(c4 & 0x3F);
    return r;
}

function encode6bit(b) {
    if (b < 10) {
        return String.fromCharCode(48 + b);
    }
    b -= 10;
    if (b < 26) {
        return String.fromCharCode(65 + b);
    }
    b -= 26;
    if (b < 26) {
        return String.fromCharCode(97 + b);
    }
    b -= 26;
    if (b == 0) {
        return '-';
    }
    if (b == 1) {
        return '_';
    }
    return '?';
}

function stringToUtf8ByteArray(str) {
    var out = [], p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (
            (c & 0xFC00) == 0xD800 && i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xFC00) == 0xDC00) {
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
}

function generateDiagram(code) {

    code = decodeURIComponent(encodeURIComponent(code));

    var utf8Bytes = stringToUtf8ByteArray(code);

    if (typeof utf8Bytes !== 'string') {
        utf8Bytes = String(utf8Bytes);
    }

    var compressedCode = encode64(utf8Bytes);

    var diagramUrl = "http://www.plantuml.com/plantuml/img/" + compressedCode;

    return diagramUrl;
}





function test(input) {
    input = decodeURIComponent(encodeURIComponent(input));
    return "http://www.plantuml.com/plantuml/img/" + encode64(zip_deflate(input, 9));
}

function zip_deflate(input, level) {
    let dictionary = {};
    let word = input[0];
    let output = "";
    let dictSize = 1;
    let windowSize = level * 100;

    for (let i = 1; i < input.length; i++) {
        let currentChar = input[i];
        if (dictionary[word + currentChar] != null && word.length < windowSize) {
            word += currentChar;
        } else {
            if (word.length === 1) {
                output += word;
            } else {
                output += dictionary[word];
            }
            dictionary[word + currentChar] = dictSize++;
            word = currentChar;
        }
    }
    if (word.length === 1) {
        output += word;
    } else {
        output += dictionary[word];
    }
    return output;
}



function utf8ToBase64Deflated(input) {
    let utf8Encoded = decodeURIComponent(encodeURIComponent(input));

    let compressed = '';
    let count = 1;
    for (let i = 1; i <= utf8Encoded.length; i++) {
        if (utf8Encoded[i] === utf8Encoded[i - 1] && i < utf8Encoded.length) {
            count++;
        } else {
            compressed += utf8Encoded[i - 1] + count;
            count = 1;
        }
    }

    let base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64Encoded = '';
    let padding = 0;
    for (let i = 0; i < compressed.length; i += 3) {
        let combined = (compressed.charCodeAt(i) << 16) | (compressed.charCodeAt(i + 1) << 8) | compressed.charCodeAt(i + 2);
        if (isNaN(compressed.charCodeAt(i + 1))) padding++;
        if (isNaN(compressed.charCodeAt(i + 2))) padding++;
        base64Encoded += base64Chars[(combined >> 18) & 63] + base64Chars[(combined >> 12) & 63] + base64Chars[(combined >> 6) & 63] + base64Chars[combined & 63];
    }
    if (padding === 2) {
        base64Encoded = base64Encoded.substring(0, base64Encoded.length - 2) + '==';
    } else if (padding === 1) {
        base64Encoded = base64Encoded.substring(0, base64Encoded.length - 1) + '=';
    }

    return "http://www.plantuml.com/plantuml/png/" + base64Encoded;
}
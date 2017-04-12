const format_size = {
    'b': 1,   // signed char - int
    'B': 1,   // unsigned char - int
    'h': 2,   // short - int
    'H': 2,   // Unsigned short - int
    'i': 4,   // int - int
    'I': 4,   // unsigned int - int
    'q': 8,   // long long - int
    'Q': 8,   // unsigned long long - int
    'f': 4,   // float
}

const endian = {
    little: '<',
    big: '>'
}

const FloatToIEEE = (f) => {
    var buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = f;
    return (new Uint32Array(buf))[0];
}

const IEEEToFloat = (ieee) => {
    var buf = new ArrayBuffer(4);
    (new Uint32Array(buf))[0] = ieee;
    return new Float32Array(buf)[0];
}

const pack = (value, size, big_endian) => {
    let chars = [];
    for (let i = 0; i < size; i++) {
        let shift = big_endian ? 8 * (size - i - 1) : 8 * i
        chars.push((value >> shift) & 0xff);
    }
    return String.fromCharCode.apply(null, chars);
}

const unpack = (str, big_endian) => {
    let value = 0;
    let n = str.length;
    for (let i = 0; i < n; i++) {
        let char = str.charCodeAt(i);
        let shift = big_endian ? 8 * (n - i - 1) : 8 * i

        value |= char << shift;
    }
    return value;
}

const struct = {}

struct.pack = (format, ...val) => {
    let result = [];
    if (format.startsWith(endian.little)) {
        format = format.substr(1);

        const pairs = _.zip(format, val);
        result = _.map(pairs, (pair, index) => {
            if (pair[0] === 'f')
                pair[1] = FloatToIEEE(pair[1]);
            
            return pack(pair[1], format_size[pair[0]], false);
        });
    } else {
        if (format.startsWith(endian.big))
            format = format.substr(1);

        const pairs = _.zip(format, val);
        result = _.map(pairs, (pair, index) => {
            if (pair[0] === 'f')
                pair[1] = FloatToIEEE(pair[1]);
            
             return pack(pair[1], format_size[pair[0]], true);
        });
    }
    
    return result.length === 1 ? result[0] : result;
}

struct.unpack = (format, str) => {
    let big_endian = true;
    if (format.startsWith(endian.little)) {
        big_endian = false;
        format = format.substr(1);
    } else if (format.startsWith(endian.big)) {
        format = format.substr(1);
    }

    let result = [];
    let offset = 0;
    _.each(Array.from(format), (_format) => {
        let _result = unpack(str.substr(offset, format_size[_format]), big_endian);
        _result = _format === 'f' ? IEEEToFloat(_result) : _result;
        result.push(_result);
        offset += format_size[_format];
    });

    result = result.length == 1 ? result[0] : result;
    return result;
}

export default struct;

export default (tmp) => {
    let str = '';
    for(let i = 0; i < tmp.length; i++) {
        let _tmp = tmp[i].charCodeAt(0).toString(16);
        if (_tmp.length === 1)
            _tmp = '0' + _tmp;
        str += _tmp;
    }
    return str;
}

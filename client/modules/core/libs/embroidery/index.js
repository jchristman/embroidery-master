import PESFile from './pes.js';
import _ from 'lodash';

const supported_formats = [
    PESFile
];

const get_format = (raw_file, name) => {
    const format = _.find(supported_formats, (_format) => {
        const tmp = new _format(raw_file, name);
        return tmp.check();
    });

    const result = new format(raw_file, name);
    result.parse();
    return result;
}

export default get_format;

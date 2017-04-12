import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';

import FileDrop from '../components/file_drop.jsx';

import get_format from '../libs/embroidery';
import { EmbroideryFormatUpdated } from '../configs/vars.js';

const target = {
    drop(props, monitor) {
        const { LocalState, Embroidery } = props.context();
        const { files } = monitor.getItem();

        const reader = new FileReader();
        
        reader.onload = (evt) => {
            const raw_file = reader.result;
            const format = get_format(raw_file, files[0].name);
            Embroidery.Format = format;
            LocalState.set(EmbroideryFormatUpdated, LocalState.get(EmbroideryFormatUpdated) + 1);
        }

        reader.readAsBinaryString(files[0]);
    }
}

const connect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
});

export default composeAll(
    DropTarget([NativeTypes.FILE], target, connect),
    useDeps()
)(FileDrop);

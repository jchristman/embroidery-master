import React from 'react';
import injectSheet from 'react-jss';

import FileDrop from '../containers/file_drop.js';
import LayerList from './layer_list.jsx';
import EditLayers from './edit_layers.jsx';
import EmbFormat from './emb_format.jsx';

const style = {
    main: {
        position: 'absolute',
        background: 'grey',
        top: 5,
        left: 5,
        width: 'calc(100% - 10px)',
        height: 'calc(100% - 10px)',
    },

    fileDrop: {
        display: 'flex',
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 60,
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },

    editLayers: {
        position: 'absolute',
        right: 0,
        top: 65,
        width: 223,
        height: 100,
        padding: 5,
        backgroundColor: 'white',
        border: '1px solid black',

        overflowY: 'auto'
    },

    layerList: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 223,
        height: 'calc(100% - 195px)',
        padding: 5,
        backgroundColor: 'white',
        border: '1px solid black',
        margin: 0,

        listStyle: 'none',
        overflowY: 'auto'
    },

    konvaRegion: {
        position: 'absolute',
        left: 0,
        top: 65,
        width: 'calc(100% - 253px)',
        height: 'calc(100% - 75px)',
        padding: 5,
        backgroundColor: 'white',
        border: '1px solid black',
    }
}

const Home = ({classes, Format, layers, handleColorChange, projectName, onProjectNameChange}) => (
    <div className={classes.main}>
        <FileDrop classes={_.pick(classes, ['fileDrop'])}/>
        <LayerList classes={_.pick(classes, ['layerList'])} format={Format} layers={layers} projectName={projectName}/>
        <EditLayers
            classes={_.pick(classes, ['editLayers'])}
            format={Format}
            layers={layers}
            handleColorChange={handleColorChange}
            projectName={projectName}
            onProjectNameChange={onProjectNameChange}/>
        <EmbFormat classes={_.pick(classes, ['konvaRegion'])} format={Format} layers={layers}/>
    </div>
);

export default injectSheet(style)(Home);

import React from 'react';
import injectSheet from 'react-jss';
import download from 'in-browser-download';

const style = {
    listItem: {
    }
}

const LayerList = (props) => {
    const { format, layers, classes, projectName } = props;

    if (format === null) return null;

    if (layers.included.length === 0)
        layers.included = _.map(format.blocks, (block) => true); // This is kinda hacky. TODO: Fix this

    return (
        <ul className={classes.layerList}>
            <li><input type="button" onClick={() => download(format.export(), `${projectName}.pes`, 'application/binary', 'base64')} value="Download PES File"/></li>
            <li><input type="button" onClick={layers.clearAll} value="Clear All"/></li>
            <li><input type="button" onClick={layers.selectAll} value="Select All"/></li>
            {
                _.map(format.blocks, (block, idx) => {
                    return ( 
                        <li key={idx}>
                            <input type="checkbox" name={idx} checked={layers.included[idx]} onChange={layers.update}/>Layer {idx}
                        </li>
                    );
                })
            }
        </ul>
    );
}

export default injectSheet(style)(LayerList);

import React from 'react';
import { SwatchesPicker } from 'react-color';

const EditLayers = (props) => {
    const { classes, format, layers, handleColorChange, onProjectNameChange, projectName } = props;

    if (format === null) return null;

    const colors = _.map(format.colors, (color) => [color]);
    const first_active_block = _.indexOf(layers.included, true);
    const color = _.reduce(layers.included, (color, layer, idx) => {
        return layer ?
            (format.blocks[idx].color === color ?
                color :
                '') :
            color;
    }, first_active_block === -1 ? '' : format.blocks[first_active_block].color);

    return (
        <div className={classes.editLayers}>
            <input
                type="text"
                onChange={onProjectNameChange}
                value={projectName}/>
            <SwatchesPicker
                width={223}
                height={100}
                color={color}
                colors={colors}
                onChange={handleColorChange}/>
        </div>
    );
}

export default EditLayers;

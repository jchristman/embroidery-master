import {useDeps, composeAll, composeWithTracker, compose} from 'mantra-core';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Home from '../components/home.jsx';

import * as VarNames from '../configs/vars.js';

const composer = ({context}, onData) => {
    const { LocalState, Embroidery } = context();
    
    LocalState.setDefault(VarNames.projectName, '');
    const projectName = LocalState.get(VarNames.projectName);
    const onProjectNameChange = (evt) => {
        const { target } = evt;
        LocalState.set(VarNames.projectName, target.value);
    }

    LocalState.setDefault(VarNames.EmbroideryFormatUpdated, 0);
    const updated = LocalState.get(VarNames.EmbroideryFormatUpdated); // This is really just here to make this re-run when we change the var

    LocalState.setDefault(VarNames.layersIncluded, []);
    const layersIncluded = LocalState.get(VarNames.layersIncluded);
    if (Embroidery.Format !== null) {
        if (layersIncluded.length !== Embroidery.Format.blocks.length) {
            LocalState.set(VarNames.layersIncluded, _.map(Embroidery.Format.blocks, (block) => true));
            LocalState.set(VarNames.projectName, Embroidery.Format.name);
        }
    }

    const layersIncludedUpdate = (evt) => {
        const { target } = evt;
        const idx = parseInt(target.name);
        layersIncluded[idx] = target.checked;
        LocalState.set(VarNames.layersIncluded, layersIncluded);
    }

    const layersIncludedClearAll = (evt) => {
        const _layersIncluded = _.map(layersIncluded, (layer) => false);
        LocalState.set(VarNames.layersIncluded, _layersIncluded);
    }

    const layersIncludedSelectAll = (evt) => {
        const _layersIncluded = _.map(layersIncluded, (layer) => true);
        LocalState.set(VarNames.layersIncluded, _layersIncluded);
    }

    const handleColorChange = (color, evt) => {
        const format = Embroidery.Format;
        _.each(layersIncluded, (layer, idx) => {
            if (layer) {
                format.blocks[idx].color = color.hex;
            }

            LocalState.set(VarNames.EmbroideryFormatUpdated, updated + 1);
        });
    }

    onData(null,
        { 
            Format: Embroidery.Format, 
            layers: {
                included: layersIncluded,
                update: layersIncludedUpdate,
                clearAll: layersIncludedClearAll,
                selectAll: layersIncludedSelectAll
            },
            handleColorChange,
            projectName,
            onProjectNameChange
        }
    );
}

export default composeAll(
    DragDropContext(HTML5Backend),
    composeWithTracker(composer),
    useDeps()
)(Home);

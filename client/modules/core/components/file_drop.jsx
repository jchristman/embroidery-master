import React from 'react';

const FileDrop = (props) => {
    const { accepts, isOver, canDrop, connectDropTarget, lastDroppedItem, classes } = props;
    const isActive = isOver && canDrop;

    let backgroundColor = '#222';
    if (isActive) {
        backgroundColor = 'darkgreen';
    } else if (canDrop) {
        backgroundColor = 'darkkhaki';
    }

    return connectDropTarget(
        <div className={classes.fileDrop} style={{ backgroundColor }}>
            {
                isActive ?
                    'Release to drop' :
                    'Drag and drop embroidery files here'
            }
        </div>
    );
}

export default FileDrop;

import React from 'react';

import RenderEmbroideryPattern from '../containers/render_embroidery_pattern.js';

class EmbFormat extends React.Component {
    render() {
        const { layers, format, classes } = this.props;
        if (format === null)
            return null;

        return (
            <div className={classes.konvaRegion}>
                <RenderEmbroideryPattern format={format} layers={layers}/>
            </div>
        );
    }
}

export default EmbFormat;

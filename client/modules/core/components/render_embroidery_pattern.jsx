import React from 'react';
import {Stage, Layer, Group, Line} from 'react-konva';
import _ from 'lodash';

const RenderEmbroideryPattern = (props) => {
    const { containerWidth, containerHeight, format, layers } = props;
    const origin = { x: containerWidth/2, y: containerHeight/2 };
    return (
        <Stage width={containerWidth} height={containerHeight} scale={{ x: 0.5, y: 0.5}}>
                {
                    _.map(format.blocks, (block, idx) => {
                        if (layers.included[idx]) {
                            return (
                                <Layer key={idx}>
                                    <Group>
                                        {
                                            _.map(block.stitches, (p1, idx2) => {
                                                if (idx2 === block.stitches.length - 1)
                                                    return null;
                                                const p2 = block.stitches[idx2 + 1];
                                                if (!p2.is_jump_stitch) {
                                                    return (
                                                        <Line
                                                            key={idx2}
                                                            x={origin.x}
                                                            y={origin.y}
                                                            points={[p1.x, p1.y, p2.x, p2.y]}
                                                            stroke={block.color}
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <Line
                                                            key={idx2}
                                                            x={origin.x}
                                                            y={origin.y}
                                                            points={[p1.x, p1.y, p2.x, p2.y]}
                                                            stroke={block.color}
                                                            strokeWidth={6}
                                                            dash={[15, 10, 5, 10]}
                                                        />
                                                    );
                                                }
                                            })
                                        }
                                    </Group>
                                </Layer>
                            );
                        }
                        return null;
                    })
                }
        </Stage>
    );
}

export default RenderEmbroideryPattern;

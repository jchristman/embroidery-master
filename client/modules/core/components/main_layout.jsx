import React from 'react';
import injectSheet from 'react-jss';

const style = {
    layout: {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        background: 'gray'
    }
}

const Layout = ({classes, content = () => null }) => (
    <div id='test' className={classes.layout}>
        {content()}
    </div>
);

export default injectSheet(style)(Layout);

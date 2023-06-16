import React from 'react';

const IFrame = ({
  children,
  inside,
  inscriptionId,
  backgroundColor = '#242638',
  height = '120px',
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe
      srcDoc={inside}
      scrolling="no"
      title={'iframe-' + inscriptionId}
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        border: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height,
        backgroundColor,
        borderRadius: '10px',
      }}
      sandbox=""
    />
  );
};

export default IFrame;

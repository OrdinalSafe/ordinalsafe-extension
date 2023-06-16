import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import IFrame from './IFrame';
import {
  hexToImgSource,
  hexToText,
  svgToHTML,
  textToHTML,
  truncate,
  imageInHtml,
  size as getSize,
} from '../utils';

const InscriptionContent = ({ inscription, className = '', size = '' }) => {
  const [inside, setInside] = useState('');
  const [w, h] = getSize(size);

  useEffect(() => {
    if (!inscription) {
      return;
    }
    if (inscription.simpleType === 'image') {
      if (inscription.type === 'image/svg+xml') {
        setInside(svgToHTML(hexToText(inscription.content), size));
      } else {
        setInside(
          imageInHtml(
            hexToImgSource(inscription.type, inscription.content),
            size
          )
        );
      }
    } else if (
      inscription.simpleType === 'text' ||
      inscription.simpleType === 'json'
    ) {
      setInside(
        textToHTML(truncate(hexToText(inscription.content), 100), size)
      );
    } else if (inscription.simpleType === 'html') {
      setInside(hexToText(inscription.content));
    }
  }, [setInside, inscription, size]);

  return (
    <div className={className}>
      {inscription ? (
        <IFrame
          backgroundColor={
            inscription.simpleType === 'html' ? 'white' : undefined
          }
          height={
            h ? h : inscription.simpleType === 'html' ? '100px' : undefined
          }
          inside={inside}
          inscriptionId={inscription.id}
        />
      ) : (
        <Skeleton width={140} height={120} />
      )}
    </div>
  );
};

export default InscriptionContent;

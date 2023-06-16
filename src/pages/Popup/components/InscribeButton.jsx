import { Button, Card, Text, useTheme } from '@geist-ui/core';
import { Plus, PlusCircle, PlusSquare } from '@geist-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';

const InscribeButton = () => {
  const theme = useTheme();
  const openInscribeTab = () => {
    window.chrome.tabs.create({
      url: 'https://ordinalsafe.xyz/inscribe',
    });
  };

  return (
    <Link
      tabIndex={-1}
      onClick={openInscribeTab}
      style={{
        padding: '0 0 0 0',
        margin: '0 0 0 0',
        width: '100%',
        height: '90px',
        zIndex: 100,
        display: 'inline-block',
      }}
    >
      <Card
        shadow
        width="90%"
        mx="auto"
        height="90px"
        mb={0}
        pb={0}
        style={{
          // align items to center in y axis
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: `0 0 0 1px ${theme.palette.success}`,
        }}
      >
        <Card.Content
          style={{
            // align items to center in y axis
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: theme.palette.success,
          }}
        >
          <Plus size={32} />
          <Text h3 margin={0}>
            Inscribe
          </Text>
        </Card.Content>
      </Card>
    </Link>
  );
};

export default InscribeButton;

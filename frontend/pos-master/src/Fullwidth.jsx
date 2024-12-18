// FullWidthButton.js
import React, { useState, useEffect } from 'react';

function FullWidthButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Full Screen');

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
      document.documentElement.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.mozFullScreenElement) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitFullscreenElement) { // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msFullscreenElement) { // IE/Edge
      document.msExitFullscreen();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1200 && isFullscreen) {
        console.log('Resize detected, current width:', window.innerWidth);
      }
    };

    const handleFullscreenChange = () => {
      // Update the fullscreen state based on the current fullscreen element
      setIsFullscreen(!!document.fullscreenElement);
      setButtonLabel(!!document.fullscreenElement ? 'Full Screen' : 'Full Screen');
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Chrome/Safari
    document.addEventListener('msfullscreenchange', handleFullscreenChange); // IE/Edge

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange); // Chrome/Safari
      document.removeEventListener('msfullscreenchange', handleFullscreenChange); // IE/Edge
    };
  }, [isFullscreen]);

  const handleClick = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '50%',
        padding: '8px',
        fontSize: '14px',
        backgroundColor: 'rgb(211 167 68)',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
      }}
    >
      {buttonLabel}
    </button>
  );
}

export default FullWidthButton;

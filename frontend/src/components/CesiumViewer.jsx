import React, { useRef, useEffect } from 'react';
import { Viewer } from 'resium';
import { Cartesian3 } from 'cesium';

export const CesiumViewer = ({ onViewerReady, loadedLayers, userLocation }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      onViewerReady(viewerRef.current.cesiumElement);
    }
  }, [onViewerReady]);

  // Fly to user location when it changes
  useEffect(() => {
    if (userLocation && viewerRef.current?.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation.longitude,
          userLocation.latitude,
          userLocation.altitude + 1000
        ),
        duration: 2.0,
      });
    }
  }, [userLocation]);

  return (
    <Viewer
      ref={viewerRef}
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      infoBox={true}
      selectionIndicator={true}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
};
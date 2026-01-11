import React, { useRef, useEffect } from 'react';
import { Viewer, Ion, Cartesian3 } from 'cesium';

export const CesiumViewer = ({ onViewerReady, loadedLayers, userLocation }) => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Create Cesium viewer
    const viewer = new Viewer(cesiumContainer.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: true,
      selectionIndicator: true,
      fullscreenButton: false,
      vrButton: false,
      shouldAnimate: true,
    });

    viewerRef.current = viewer;
    onViewerReady(viewer);

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [onViewerReady]);

  // Fly to user location when it changes
  useEffect(() => {
    if (userLocation && viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation.longitude,
          userLocation.latitude,
          userLocation.altitude + 10000
        ),
        duration: 2.0,
      });
    }
  }, [userLocation]);

  return (
    <div
      ref={cesiumContainer}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};
import React, { useRef, useEffect } from 'react';
import { Viewer, Camera } from 'resium';
import { Ion, Cartesian3, Math as CesiumMath } from 'cesium';
import { LoadedLayer } from '../types';

interface CesiumViewerProps {
  onViewerReady: (viewer: any) => void;
  loadedLayers: LoadedLayer[];
  userLocation: { longitude: number; latitude: number; altitude: number } | null;
}

export const CesiumViewer: React.FC<CesiumViewerProps> = ({
  onViewerReady,
  loadedLayers,
  userLocation,
}) => {
  const viewerRef = useRef<any>(null);

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
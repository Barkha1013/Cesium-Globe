import React, { useState, useCallback, useEffect } from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { CesiumViewer } from './components/CesiumViewer';
import { LayerManager } from './components/LayerManager';
import { SearchBox } from './components/SearchBox';
import { MyLocationButton } from './components/MyLocationButton';
import { DatasetButtons } from './components/DatasetButtons';
import { initializeCesiumIon, CESIUM_ASSETS } from './services/cesiumAssets';
import { LoadedLayer } from './types';
import {
  Ion,
  IonResource,
  Cartesian3,
  GeoJsonDataSource,
  Cesium3DTileset,
  ImageryLayer,
  createWorldTerrainAsync,
  Terrain,
  Color,
} from 'cesium';

const App: React.FC = () => {
  const [viewer, setViewer] = useState<any>(null);
  const [loadedLayers, setLoadedLayers] = useState<LoadedLayer[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<Set<number>>(new Set());
  const [loadedAssets, setLoadedAssets] = useState<Set<number>>(new Set());
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
    altitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMarker, setLocationMarker] = useState<any>(null);

  // Initialize Cesium Ion
  useEffect(() => {
    const token = process.env.REACT_APP_CESIUM_TOKEN;
    if (token) {
      initializeCesiumIon(token);
    } else {
      toast.error('Cesium Ion token not found. Please check your .env file.');
    }
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude, altitude } = position.coords;
        setUserLocation({
          longitude,
          latitude,
          altitude: altitude || 0,
        });

        // Add marker for user location
        if (viewer) {
          // Remove previous marker if exists
          if (locationMarker) {
            viewer.entities.remove(locationMarker);
          }

          const marker = viewer.entities.add({
            position: Cartesian3.fromDegrees(longitude, latitude),
            point: {
              pixelSize: 12,
              color: Color.fromCssColorString('#2BB0C8'),
              outlineColor: Color.WHITE,
              outlineWidth: 2,
            },
            label: {
              text: 'Your Location',
              font: '14px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: 1,
              verticalOrigin: 1,
              pixelOffset: new Cartesian3(0, -20, 0),
            },
          });
          setLocationMarker(marker);
        }

        toast.success('Location found!');
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error(`Location access denied: ${error.message}`);
        setIsLocating(false);
      }
    );
  }, [viewer, locationMarker]);

  const loadAsset = useCallback(
    async (assetId: number) => {
      if (!viewer || loadingAssets.has(assetId) || loadedAssets.has(assetId)) {
        return;
      }

      const asset = CESIUM_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      setLoadingAssets((prev) => new Set(prev).add(assetId));
      toast.loading(`Loading ${asset.name}...`, { id: `loading-${assetId}` });

      try {
        let resource: any;
        let layerId = `layer-${assetId}`;

        switch (asset.type) {
          case 'terrain':
            // Load terrain
            const terrainProvider = await createWorldTerrainAsync({
              requestWaterMask: true,
              requestVertexNormals: true,
            });
            viewer.terrainProvider = terrainProvider;
            resource = terrainProvider;
            break;

          case 'geojson':
            // Load GeoJSON
            const ionResource = await IonResource.fromAssetId(assetId);
            const dataSource = await GeoJsonDataSource.load(ionResource, {
              stroke: Color.fromCssColorString('#2BB0C8'),
              fill: Color.fromCssColorString('#2BB0C8').withAlpha(0.3),
              strokeWidth: 2,
            });
            await viewer.dataSources.add(dataSource);
            resource = dataSource;

            // Zoom to the data
            viewer.flyTo(dataSource, {
              duration: 2.0,
            });
            break;

          case 'imagery':
            // Load imagery layer
            const imageryProvider = await IonResource.fromAssetId(assetId);
            const imageryLayer = new ImageryLayer(imageryProvider);
            viewer.imageryLayers.add(imageryLayer);
            resource = imageryLayer;
            break;

          case '3dtiles':
            // Load 3D Tiles
            const tileset = await Cesium3DTileset.fromIonAssetId(assetId);
            viewer.scene.primitives.add(tileset);
            resource = tileset;

            // Zoom to the tileset
            viewer.flyTo(tileset, {
              duration: 2.0,
            });
            break;
        }

        // Add to loaded layers
        const newLayer: LoadedLayer = {
          id: layerId,
          assetId,
          name: asset.name,
          type: asset.type,
          description: asset.description,
          visible: true,
          resource,
        };

        setLoadedLayers((prev) => [...prev, newLayer]);
        setLoadedAssets((prev) => new Set(prev).add(assetId));
        toast.success(`${asset.name} loaded successfully!`, { id: `loading-${assetId}` });
      } catch (error) {
        console.error('Error loading asset:', error);
        toast.error(`Failed to load ${asset.name}`, { id: `loading-${assetId}` });
      } finally {
        setLoadingAssets((prev) => {
          const newSet = new Set(prev);
          newSet.delete(assetId);
          return newSet;
        });
      }
    },
    [viewer, loadingAssets, loadedAssets]
  );

  const toggleLayer = useCallback(
    (layerId: string) => {
      setLoadedLayers((prev) =>
        prev.map((layer) => {
          if (layer.id === layerId) {
            const newVisible = !layer.visible;

            // Toggle visibility in Cesium
            if (layer.resource) {
              if (layer.type === 'geojson') {
                layer.resource.show = newVisible;
              } else if (layer.type === 'imagery') {
                layer.resource.show = newVisible;
              } else if (layer.type === '3dtiles') {
                layer.resource.show = newVisible;
              }
            }

            return { ...layer, visible: newVisible };
          }
          return layer;
        })
      );
    },
    []
  );

  const removeLayer = useCallback(
    (layerId: string) => {
      const layer = loadedLayers.find((l) => l.id === layerId);
      if (!layer || !viewer) return;

      // Remove from Cesium
      try {
        if (layer.type === 'geojson' && layer.resource) {
          viewer.dataSources.remove(layer.resource);
        } else if (layer.type === 'imagery' && layer.resource) {
          viewer.imageryLayers.remove(layer.resource);
        } else if (layer.type === '3dtiles' && layer.resource) {
          viewer.scene.primitives.remove(layer.resource);
        } else if (layer.type === 'terrain') {
          // Reset to default terrain
          viewer.terrainProvider = new Terrain();
        }
      } catch (error) {
        console.error('Error removing layer:', error);
      }

      // Remove from state
      setLoadedLayers((prev) => prev.filter((l) => l.id !== layerId));
      setLoadedAssets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(layer.assetId);
        return newSet;
      });

      toast.success(`${layer.name} removed`);
    },
    [loadedLayers, viewer]
  );

  const handleLocationSearch = useCallback(
    async (query: string) => {
      if (!viewer) return;

      try {
        // Use Cesium's geocoding service
        const results = await Ion.geocode(query);
        if (results && results.length > 0) {
          const result = results[0];
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              result.longitude,
              result.latitude,
              10000
            ),
            duration: 2.0,
          });
          toast.success(`Found: ${result.displayName}`);
        } else {
          toast.error('Location not found');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.error('Failed to search location');
      }
    },
    [viewer]
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Cesium Viewer */}
      <CesiumViewer
        onViewerReady={setViewer}
        loadedLayers={loadedLayers}
        userLocation={userLocation}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="pointer-events-auto glass-panel rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Cesium Globe</h1>
                <p className="text-xs text-muted-foreground">Geospatial Visualization</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="pointer-events-auto ml-auto">
              <SearchBox
                onLocationSearch={handleLocationSearch}
                onLayerSelect={loadAsset}
                loadedLayers={loadedLayers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Layer Manager */}
      <div className="absolute left-0 top-24 bottom-6 z-10 w-80 p-6 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <LayerManager
            loadedLayers={loadedLayers}
            onToggleLayer={toggleLayer}
            onRemoveLayer={removeLayer}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <DatasetButtons
            onLoadAsset={loadAsset}
            loadingAssets={loadingAssets}
            loadedAssets={loadedAssets}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute right-6 bottom-6 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <MyLocationButton onClick={requestUserLocation} loading={isLocating} />
        </div>
      </div>

      {/* Info Banner */}
      {!viewer && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="glass-panel rounded-lg px-6 py-4 flex items-center gap-3 animate-pulse-glow">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground">Initializing Cesium Globe...</p>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" />
    </div>
  );
};

export default App;
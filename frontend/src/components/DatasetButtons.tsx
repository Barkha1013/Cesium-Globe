import React from 'react';
import { Mountain, Map, Image, Box, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CESIUM_ASSETS } from '../services/cesiumAssets';

interface DatasetButtonsProps {
  onLoadAsset: (assetId: number) => void;
  loadingAssets: Set<number>;
  loadedAssets: Set<number>;
}

export const DatasetButtons: React.FC<DatasetButtonsProps> = ({
  onLoadAsset,
  loadingAssets,
  loadedAssets,
}) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'terrain':
        return <Mountain className="h-4 w-4" />;
      case 'geojson':
        return <Map className="h-4 w-4" />;
      case 'imagery':
        return <Image className="h-4 w-4" />;
      case '3dtiles':
        return <Box className="h-4 w-4" />;
      default:
        return <Map className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="glass-panel rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Load Datasets</h3>
        <div className="flex flex-wrap gap-2">
          {CESIUM_ASSETS.map((asset) => {
            const isLoading = loadingAssets.has(asset.id);
            const isLoaded = loadedAssets.has(asset.id);

            return (
              <Tooltip key={asset.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onLoadAsset(asset.id)}
                    disabled={isLoading || isLoaded}
                    size="sm"
                    variant={isLoaded ? 'secondary' : 'outline'}
                    className="gap-2 transition-all hover:shadow-md hover:scale-105"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getAssetIcon(asset.type)
                    )}
                    <span className="text-xs">{asset.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="glass-panel max-w-xs">
                  <p className="text-xs">{asset.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
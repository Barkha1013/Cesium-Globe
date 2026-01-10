import React from 'react';
import { Layers, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';

export const LayerManager = ({ loadedLayers, onToggleLayer, onRemoveLayer }) => {
  const getLayerIcon = (type) => {
    return <Layers className="h-4 w-4" />;
  };

  const getLayerTypeColor = (type) => {
    switch (type) {
      case 'terrain':
        return 'bg-amber-500/20 text-amber-400';
      case 'geojson':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'imagery':
        return 'bg-blue-500/20 text-blue-400';
      case '3dtiles':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="glass-panel rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Data</h2>
            <p className="text-sm text-muted-foreground">
              {loadedLayers.length} layer{loadedLayers.length !== 1 ? 's' : ''} loaded
            </p>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-2">
          {loadedLayers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex p-4 rounded-full bg-muted/30 mb-4">
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                No layers loaded yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Use the buttons below to load datasets
              </p>
            </div>
          ) : (
            loadedLayers.map((layer) => (
              <div
                key={layer.id}
                className="group p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-200 animate-slideInLeft"
              >
                <div className="flex items-start gap-3">
                  {/* Layer Icon & Type Badge */}
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-md ${getLayerTypeColor(layer.type)}`}>
                      {getLayerIcon(layer.type)}
                    </div>
                  </div>

                  {/* Layer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {layer.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getLayerTypeColor(layer.type)} flex-shrink-0`}
                      >
                        {layer.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {layer.description}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Switch
                          checked={layer.visible}
                          onCheckedChange={() => onToggleLayer(layer.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className="text-xs text-muted-foreground">
                          {layer.visible ? (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Visible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </span>
                          )}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveLayer(layer.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
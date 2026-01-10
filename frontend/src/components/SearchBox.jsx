import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Layers, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { CESIUM_ASSETS } from '../services/cesiumAssets';

export const SearchBox = ({ onLocationSearch, onLayerSelect, loadedLayers }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Filter available assets and loaded layers
  useEffect(() => {
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      // Search in available assets
      const assetMatches = CESIUM_ASSETS.filter(
        (asset) =>
          asset.name.toLowerCase().includes(lowerQuery) ||
          asset.description.toLowerCase().includes(lowerQuery)
      ).map((asset) => ({
        type: 'asset',
        ...asset,
      }));

      // Search in loaded layers
      const layerMatches = loadedLayers
        .filter(
          (layer) =>
            layer.name.toLowerCase().includes(lowerQuery) ||
            layer.description.toLowerCase().includes(lowerQuery)
        )
        .map((layer) => ({
          type: 'layer',
          ...layer,
        }));

      // Add location search suggestion
      const locationSuggestion = {
        type: 'location',
        query,
      };

      setSuggestions([locationSuggestion, ...assetMatches, ...layerMatches]);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, loadedLayers]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    if (item.type === 'location') {
      onLocationSearch(item.query);
      setQuery('');
      setIsOpen(false);
    } else if (item.type === 'asset') {
      onLayerSelect(item.id);
      setQuery('');
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      {/* Search Input */}
      <div className="relative glass-panel rounded-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search locations or layers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-10 h-12 bg-transparent border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-panel rounded-lg shadow-xl animate-fadeIn z-50">
          <ScrollArea className="max-h-80 custom-scrollbar">
            <div className="p-2">
              {suggestions.map((item, index) => (
                <button
                  key={`${item.type}-${index}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'location' ? (
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-md bg-accent/10 text-accent">
                        <Layers className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {item.type === 'location' ? (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            Search for "{item.query}"
                          </p>
                          <p className="text-xs text-muted-foreground">Find location on map</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </>
                      )}
                    </div>
                    {item.type !== 'location' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.type}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
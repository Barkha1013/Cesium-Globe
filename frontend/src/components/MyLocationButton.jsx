import React from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export const MyLocationButton = ({ onClick, loading }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={loading}
            size="icon"
            className="h-12 w-12 rounded-full glass-panel border border-border/50 hover:border-primary/50 bg-card/90 hover:bg-card shadow-lg"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Navigation className="h-5 w-5 text-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="glass-panel">
          <p className="text-sm">My Location</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
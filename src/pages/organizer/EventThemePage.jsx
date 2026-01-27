// src/pages/organizer/EventThemePage.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { EVENT_THEMES } from '@/data/themes';
import {
  ArrowLeft,
  Palette,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';

function EventThemePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEvent(eventId);
  const updateEventMutation = useUpdateEvent();

  const initialThemeId = event?.theme_name || '';
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);

  const selectedTheme = useMemo(() => {
    if (!selectedThemeId) {
      return null;
    }
    let found = null;
    EVENT_THEMES.forEach((t) => {
      if (t.id === selectedThemeId) {
        found = t;
      }
    });
    return found;
  }, [selectedThemeId]);

  const handleSelectTheme = (themeId) => {
    setSelectedThemeId(themeId);
  };

  const handleSaveTheme = () => {
    if (!selectedTheme) {
      return;
    }
    const updates = {
      theme_name: selectedTheme.id,
      theme_palette: selectedTheme.palette,
    };
    updateEventMutation.mutate({ eventId, updates });
  };

  if (isLoading) {
    return <ThemeSkeleton />;
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <EmptyState
          icon={Palette}
          title="Event not found"
          description="The event you are trying to theme does not exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Event Theme & Decoration
          </h1>
          <p className="text-sm text-muted-foreground">
            {event.title}
          </p>
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Choose a theme
          </CardTitle>
          <CardDescription>
            Select a decoration theme and color palette. You can share this with your decorator and vendors.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Theme Library */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Theme Library</CardTitle>
            <CardDescription>
              Pick one of the pre-defined themes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {EVENT_THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              const cardClass = getThemeCardClass(isSelected);

              return (
                <button
                  key={theme.id}
                  type="button"
                  className={cardClass}
                  onClick={() => handleSelectTheme(theme.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{theme.name}</p>
                    {isSelected && (
                      <Badge variant="default" className="text-[10px] px-2 py-0">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {theme.description}
                  </p>
                  <div className="flex gap-2">
                    <PaletteSwatch color={theme.palette.primary} label="Primary" />
                    <PaletteSwatch color={theme.palette.secondary} label="Secondary" />
                    <PaletteSwatch color={theme.palette.accent} label="Accent" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Preview & Save */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Preview & Save</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedTheme && (
              <p className="text-sm text-muted-foreground">
                Select a theme from the list to see a preview.
              </p>
            )}

            {selectedTheme && (
              <div className="space-y-2">
                <p className="font-medium text-sm">{selectedTheme.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTheme.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <PaletteSwatch color={selectedTheme.palette.primary} label="Primary" />
                  <PaletteSwatch color={selectedTheme.palette.secondary} label="Secondary" />
                  <PaletteSwatch color={selectedTheme.palette.accent} label="Accent" />
                </div>
              </div>
            )}

            <Button
              className="mt-3"
              onClick={handleSaveTheme}
              disabled={!selectedTheme || updateEventMutation.isPending}
            >
              Save Theme
            </Button>

            {event.theme_name && (
              <div className="mt-4 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Current saved theme:
                </p>
                <p className="text-sm font-medium">
                  {getThemeNameFromId(event.theme_name)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getThemeCardClass(isSelected) {
  const base =
    'w-full rounded-lg border p-3 text-left transition-colors hover:border-primary cursor-pointer';
  if (isSelected) {
    return base + ' border-primary bg-primary/5';
  }
  return base + ' border-border';
}

function PaletteSwatch({ color, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-6 w-6 rounded-full border"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function getThemeNameFromId(themeId) {
  let name = themeId;
  EVENT_THEMES.forEach((t) => {
    if (t.id === themeId) {
      name = t.name;
    }
  });
  return name;
}

function ThemeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 w-full lg:col-span-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default EventThemePage;
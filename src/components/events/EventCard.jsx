// src/components/events/EventCard.jsx
import React from 'react';
import { FlipCard } from '@/components/ui/FlipCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Users,
  ChevronRight,
  Eye,
  Ticket,
  Star,
  RotateCw
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export const EventCard = ({ 
  event, 
  viewMode = 'grid', 
  isSaved = false,
  onToggleSave,
  onClick 
}) => {
  // Safe date parsing
  const eventDate = event.date ? new Date(event.date) : new Date();
  const isValidDate = !isNaN(eventDate.getTime());

  // GRID VIEW with Flip Animation
  if (viewMode === 'grid') {
    
    // Front of the card
    const CardFront = () => (
      <div className="w-full h-full">
        <Card className="h-full bg-slate-900 border-slate-700 overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          {/* Image Section */}
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-white/20" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

            {/* Category Badge */}
            {event.category && (
              <Badge className="absolute top-3 left-3 bg-purple-600/90 text-white border-0 backdrop-blur-sm">
                {event.category}
              </Badge>
            )}

            {/* Save Button */}
            <button
              className={cn(
                "absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300",
                "bg-black/40 hover:bg-black/60 backdrop-blur-sm",
                isSaved && "bg-red-500/80 hover:bg-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.();
              }}
            >
              <Heart 
                className={cn(
                  'w-4 h-4 transition-all',
                  isSaved ? 'fill-white text-white' : 'text-white'
                )} 
              />
            </button>

            {/* Date Badge */}
            {isValidDate && (
              <div className="absolute bottom-3 left-3 bg-white rounded-lg px-3 py-2 text-center shadow-lg">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  {format(eventDate, 'MMM')}
                </p>
                <p className="text-xl font-black text-slate-900 leading-none">
                  {format(eventDate, 'dd')}
                </p>
              </div>
            )}
          </div>

          {/* Content Section */}
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-slate-400">
                by {event.organizer?.full_name || event.organizer?.company_name || 'Organizer'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{event.start_time || '7:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span className="truncate">{event.location || 'Location TBA'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">From</p>
                <p className="text-xl font-bold text-white">
                  ${event.min_ticket_price || 0}
                </p>
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-xs font-medium">
                <RotateCw className="w-3 h-3" />
                <span>Click to flip</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );

    // Back of the card
    const CardBack = () => (
      <div className="w-full h-full">
        <Card className="h-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 border-0 overflow-hidden">
          <CardContent className="p-5 h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2">
                {event.category || 'Event'}
              </Badge>
              <h3 className="font-bold text-white text-lg line-clamp-2">
                {event.title}
              </h3>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Available
                </span>
                <span className="font-bold text-white">
                  {event.available_tickets ?? 100}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Views
                </span>
                <span className="font-bold text-white">
                  {event.view_count ?? 0}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating
                </span>
                <span className="font-bold text-white">
                  4.8 ★
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Capacity
                </span>
                <span className="font-bold text-white">
                  {event.total_tickets ?? 500}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              className="w-full mt-4 bg-white text-purple-700 hover:bg-white/90 font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              Book Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {/* Flip hint */}
            <p className="text-center text-white/60 text-xs mt-2 flex items-center justify-center gap-1">
              <RotateCw className="w-3 h-3" />
              Click to flip back
            </p>
          </CardContent>
        </Card>
      </div>
    );

    return (
      <div className="h-[420px]">
        <FlipCard
          front={<CardFront />}
          back={<CardBack />}
        />
      </div>
    );
  }

  // LIST VIEW (No flip)
  return (
    <Card 
      className="bg-slate-900 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white text-lg line-clamp-1">
                  {event.title}
                </h3>
                <button
                  className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave?.();
                  }}
                >
                  <Heart 
                    className={cn(
                      'w-4 h-4',
                      isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'
                    )} 
                  />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-2">
                {event.organizer?.full_name || 'Organizer'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {isValidDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {format(eventDate, 'MMM dd, yyyy')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  {event.start_time || '7:00 PM'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate max-w-[150px]">{event.location}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-xs text-slate-500">From </span>
                <span className="text-lg font-bold text-white">
                  ${event.min_ticket_price || 0}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
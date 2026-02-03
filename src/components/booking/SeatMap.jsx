// src/components/booking/SeatMap.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, 
  Users, 
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Seat status colors
const seatColors = {
  available: 'bg-slate-700 hover:bg-emerald-500 hover:scale-110 cursor-pointer',
  selected: 'bg-emerald-500 ring-2 ring-emerald-300 scale-110',
  occupied: 'bg-red-500/50 cursor-not-allowed',
  reserved: 'bg-amber-500/50 cursor-not-allowed',
  vip: 'bg-purple-600 hover:bg-purple-500 hover:scale-110 cursor-pointer',
  premium: 'bg-amber-600 hover:bg-amber-500 hover:scale-110 cursor-pointer',
  wheelchair: 'bg-blue-600 hover:bg-blue-500 hover:scale-110 cursor-pointer',
};

// Generate seat layout
const generateSeatLayout = (config) => {
  const layout = [];
  const rows = config.rows || 10;
  const seatsPerRow = config.seatsPerRow || 12;
  const aisleAfter = config.aisleAfter || [3, 8];
  const vipRows = config.vipRows || [0, 1];
  const premiumRows = config.premiumRows || [2, 3];
  const occupiedSeats = config.occupiedSeats || [];

  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row);
    const seats = [];

    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatId = `${rowLetter}${seat}`;
      let type = 'regular';
      let status = 'available';

      if (vipRows.includes(row)) type = 'vip';
      else if (premiumRows.includes(row)) type = 'premium';

      if (occupiedSeats.includes(seatId)) status = 'occupied';

      seats.push({
        id: seatId,
        row: rowLetter,
        number: seat,
        type,
        status,
        price: type === 'vip' ? 199 : type === 'premium' ? 149 : 99,
        hasAisleAfter: aisleAfter.includes(seat),
      });
    }

    layout.push({
      row: rowLetter,
      seats,
    });
  }

  return layout;
};

export function SeatMap({
  eventId,
  maxSeats = 10,
  onSeatSelect,
  selectedSeats = [],
  config = {},
}) {
  const [zoom, setZoom] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Generate layout with some occupied seats for demo
  const seatLayout = useMemo(() => {
    const occupiedSeats = [
      'A3', 'A4', 'A5', 'B2', 'B7', 'B8', 'C1', 'C5', 'C6',
      'D3', 'D4', 'E7', 'E8', 'E9', 'F2', 'F3', 'G5', 'G6',
      'H1', 'H2', 'H10', 'H11', 'I4', 'I5', 'J6', 'J7', 'J8'
    ];
    return generateSeatLayout({
      rows: 10,
      seatsPerRow: 12,
      aisleAfter: [4, 8],
      vipRows: [0, 1],
      premiumRows: [2, 3],
      occupiedSeats,
      ...config,
    });
  }, [config]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'occupied' || seat.status === 'reserved') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      onSeatSelect?.(selectedSeats.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect?.([...selectedSeats, seat]);
    }
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return 'selected';
    return seat.status;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(z => Math.min(z + 0.2, 1.5))}
            className="border-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}
            className="border-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(1)}
            className="border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-slate-600">
            <Users className="w-3 h-3 mr-1" />
            {selectedSeats.length} / {maxSeats} seats
          </Badge>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700" />
          <span className="text-xs text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-xs text-slate-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/50" />
          <span className="text-xs text-slate-400">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600" />
          <span className="text-xs text-slate-400">VIP ($199)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-600" />
          <span className="text-xs text-slate-400">Premium ($149)</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="relative bg-slate-900 rounded-xl p-6 overflow-hidden">
        {/* Stage */}
        <div className="mb-8">
          <div className="relative mx-auto w-3/4 h-12 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-t-full flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium">STAGE</span>
          </div>
          <div className="mx-auto w-4/5 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
        </div>

        {/* Seats Container */}
        <ScrollArea className="w-full">
          <div 
            className="flex flex-col items-center gap-2 transition-transform duration-300"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            {seatLayout.map((row) => (
              <div key={row.row} className="flex items-center gap-1">
                {/* Row label */}
                <div className="w-6 text-center text-xs font-bold text-slate-500">
                  {row.row}
                </div>

                {/* Seats */}
                <div className="flex gap-1">
                  {row.seats.map((seat) => {
                    const status = getSeatStatus(seat);
                    const isSelected = status === 'selected';
                    const isHovered = hoveredSeat?.id === seat.id;

                    return (
                      <React.Fragment key={seat.id}>
                        <motion.button
                          whileHover={{ scale: status !== 'occupied' ? 1.15 : 1 }}
                          whileTap={{ scale: status !== 'occupied' ? 0.95 : 1 }}
                          className={cn(
                            'w-7 h-7 rounded-t-lg text-[10px] font-bold transition-all duration-200',
                            'flex items-center justify-center',
                            status === 'selected' && 'bg-emerald-500 text-white ring-2 ring-emerald-300',
                            status === 'available' && seat.type === 'vip' && seatColors.vip,
                            status === 'available' && seat.type === 'premium' && seatColors.premium,
                            status === 'available' && seat.type === 'regular' && seatColors.available,
                            status === 'occupied' && seatColors.occupied,
                            'text-white'
                          )}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={status === 'occupied'}
                        >
                          {seat.number}
                        </motion.button>

                        {/* Aisle gap */}
                        {seat.hasAisleAfter && <div className="w-4" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row label (right) */}
                <div className="w-6 text-center text-xs font-bold text-slate-500">
                  {row.row}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredSeat && hoveredSeat.status !== 'occupied' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-bold text-white">Seat {hoveredSeat.id}</p>
                  <p className="text-xs text-slate-400 capitalize">{hoveredSeat.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">${hoveredSeat.price}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Seats Summary */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 font-medium">Selected Seats</span>
              <span className="text-white font-bold">${totalPrice}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <Badge
                  key={seat.id}
                  className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat.id} - ${seat.price}
                  <span className="ml-1 opacity-60">×</span>
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SeatMap;
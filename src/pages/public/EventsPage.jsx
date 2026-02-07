// src/pages/public/EventsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isAfter, isBefore, isToday, isThisWeek, addDays } from 'date-fns';

// UI Components (shadcn)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Heart,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  SlidersHorizontal,
  Loader2,
  ArrowUpDown,
  Eye,
  Ticket,
  Zap,
  Music,
  Palette,
  GraduationCap,
  Utensils,
  Dumbbell,
  Briefcase,
  Gamepad2,
  Globe,
  Timer,
  BookmarkPlus,
  ExternalLink,
  CalendarDays,
  Filter,
  Star,
  ArrowRight,
  Flame,
  Tag,
} from 'lucide-react';

import { toast } from 'sonner';

// ============================================================
// UTILITY - cn helper
// ============================================================
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Tech Conference 2025 — Future of AI',
    description: 'Join 2000+ developers and tech leaders for the biggest AI conference of the year. Featuring keynotes, workshops, and networking.',
    date: '2025-02-20',
    start_date: '2025-02-20T10:00:00',
    start_time: '10:00 AM',
    end_time: '6:00 PM',
    location: 'Convention Center, San Francisco',
    category: 'technology',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    price: 199,
    available_tickets: 150,
    max_attendees: 2000,
    attendees_count: 1850,
    view_count: 12340,
    is_featured: true,
    organizer: { full_name: 'TechCorp Inc.', avatar_url: null },
    tags: ['AI', 'Machine Learning', 'Tech'],
  },
  {
    id: '2',
    title: 'Summer Music Festival — Sunset Vibes',
    description: 'Three days of incredible live music featuring top artists from around the world. Food, art, and unforgettable moments.',
    date: '2025-01-25',
    start_date: '2025-01-25T16:00:00',
    start_time: '4:00 PM',
    end_time: '11:00 PM',
    location: 'Central Park, New York',
    category: 'music',
    image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    price: 149,
    available_tickets: 300,
    max_attendees: 5000,
    attendees_count: 4700,
    view_count: 45680,
    is_featured: true,
    organizer: { full_name: 'Live Events Co.' },
    tags: ['Live Music', 'Festival', 'Outdoor'],
  },
  {
    id: '3',
    title: 'Modern Art Exhibition: Beyond Boundaries',
    description: 'Explore cutting-edge contemporary art from 50+ international artists. Interactive installations and guided tours available.',
    date: '2025-02-28',
    start_date: '2025-02-28T11:00:00',
    start_time: '11:00 AM',
    end_time: '8:00 PM',
    location: 'Modern Art Museum, Chicago',
    category: 'art',
    image_url: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
    price: 35,
    available_tickets: 80,
    max_attendees: 200,
    attendees_count: 120,
    view_count: 3890,
    is_featured: false,
    organizer: { full_name: 'Art Gallery Chicago' },
    tags: ['Art', 'Exhibition', 'Culture'],
  },
  {
    id: '4',
    title: 'Startup Pitch Night — Season 12',
    description: '10 promising startups pitch to a panel of top VCs. Network with founders, investors, and innovators.',
    date: '2025-03-05',
    start_date: '2025-03-05T18:00:00',
    start_time: '6:00 PM',
    end_time: '10:00 PM',
    location: 'Innovation Hub, Austin TX',
    category: 'business',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
    price: 0,
    available_tickets: 120,
    max_attendees: 200,
    attendees_count: 80,
    view_count: 2456,
    is_featured: false,
    organizer: { full_name: 'Startup Weekly' },
    tags: ['Startup', 'Pitch', 'Networking'],
  },
  {
    id: '5',
    title: 'Food & Wine Festival 2025',
    description: 'Taste dishes from 40+ top restaurants, sample wines from 20 vineyards, and enjoy live cooking demonstrations.',
    date: '2025-03-10',
    start_date: '2025-03-10T12:00:00',
    start_time: '12:00 PM',
    end_time: '9:00 PM',
    location: 'Waterfront Plaza, Miami',
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    price: 85,
    available_tickets: 500,
    max_attendees: 1500,
    attendees_count: 1000,
    view_count: 8345,
    is_featured: true,
    organizer: { full_name: 'Gourmet Events' },
    tags: ['Food', 'Wine', 'Festival'],
  },
  {
    id: '6',
    title: 'Stand-Up Comedy Night: Laugh Out Loud',
    description: 'An evening of non-stop laughs with 5 top comedians. Includes 2 drinks and appetizers.',
    date: '2025-01-30',
    start_date: '2025-01-30T20:00:00',
    start_time: '8:00 PM',
    end_time: '11:00 PM',
    location: 'Laugh Factory, Los Angeles',
    category: 'community',
    image_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
    price: 45,
    available_tickets: 75,
    max_attendees: 150,
    attendees_count: 75,
    view_count: 1678,
    is_featured: false,
    organizer: { full_name: 'Comedy Central Live' },
    tags: ['Comedy', 'Entertainment', 'Night Out'],
  },
  {
    id: '7',
    title: 'Yoga & Mindfulness Retreat',
    description: 'A full-day wellness retreat with yoga sessions, meditation workshops, organic meals, and nature walks.',
    date: '2025-03-20',
    start_date: '2025-03-20T07:00:00',
    start_time: '7:00 AM',
    end_time: '5:00 PM',
    location: 'Serenity Gardens, Sedona AZ',
    category: 'sports',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    price: 150,
    available_tickets: 15,
    max_attendees: 50,
    attendees_count: 35,
    view_count: 1234,
    is_featured: false,
    organizer: { full_name: 'Zen Living' },
    tags: ['Yoga', 'Wellness', 'Retreat'],
  },
  {
    id: '8',
    title: 'Pro Gaming Tournament — Championship Finals',
    description: 'Watch the top 16 teams battle for the championship title. Live commentary, meet & greet, and prize giveaways.',
    date: '2025-02-15',
    start_date: '2025-02-15T11:00:00',
    start_time: '11:00 AM',
    end_time: '8:00 PM',
    location: 'eSports Arena, Las Vegas',
    category: 'gaming',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    price: 65,
    available_tickets: 250,
    max_attendees: 500,
    attendees_count: 250,
    view_count: 15456,
    is_featured: true,
    organizer: { full_name: 'Pro Gaming League' },
    tags: ['Gaming', 'eSports', 'Tournament'],
  },
  {
    id: '9',
    title: 'Web Development Bootcamp',
    description: 'Intensive 2-day workshop covering React, Next.js, and modern web development practices. Suitable for all levels.',
    date: '2025-03-01',
    start_date: '2025-03-01T09:00:00',
    start_time: '9:00 AM',
    end_time: '5:00 PM',
    location: 'Google Campus, Mountain View',
    category: 'education',
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    price: 0,
    available_tickets: 50,
    max_attendees: 100,
    attendees_count: 50,
    view_count: 5670,
    is_featured: false,
    organizer: { full_name: 'Code Academy' },
    tags: ['Coding', 'Workshop', 'React'],
  },
  {
    id: '10',
    title: 'Neon Night Run 5K',
    description: 'Run through a neon-lit course with UV paint, glow sticks, and EDM music. Fun for all fitness levels!',
    date: '2025-02-08',
    start_date: '2025-02-08T19:00:00',
    start_time: '7:00 PM',
    end_time: '10:00 PM',
    location: 'Downtown, Denver',
    category: 'sports',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    price: 40,
    available_tickets: 800,
    max_attendees: 2000,
    attendees_count: 1200,
    view_count: 6780,
    is_featured: false,
    organizer: { full_name: 'Run For Fun' },
    tags: ['Running', 'Fitness', 'Night Event'],
  },
  {
    id: '11',
    title: 'Photography Masterclass with Nat Geo',
    description: 'Learn from National Geographic photographers. Covers landscape, wildlife, and street photography techniques.',
    date: '2025-03-15',
    start_date: '2025-03-15T10:00:00',
    start_time: '10:00 AM',
    end_time: '4:00 PM',
    location: 'Photography Studio, Seattle',
    category: 'education',
    image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
    price: 120,
    available_tickets: 20,
    max_attendees: 30,
    attendees_count: 10,
    view_count: 2340,
    is_featured: false,
    organizer: { full_name: 'Creative Studios' },
    tags: ['Photography', 'Masterclass', 'Workshop'],
  },
  {
    id: '12',
    title: 'Blockchain & Web3 Summit',
    description: 'Deep dive into blockchain technology, DeFi, NFTs, and the future of decentralized web. Industry leaders speak.',
    date: '2025-02-25',
    start_date: '2025-02-25T09:00:00',
    start_time: '9:00 AM',
    end_time: '6:00 PM',
    location: 'Crypto Convention Center, Miami',
    category: 'technology',
    image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    price: 299,
    available_tickets: 100,
    max_attendees: 1000,
    attendees_count: 900,
    view_count: 9870,
    is_featured: true,
    organizer: { full_name: 'Web3 Foundation' },
    tags: ['Blockchain', 'Web3', 'Crypto'],
  },
];

// ============================================================
// CATEGORY CONFIG
// ============================================================
const CATEGORY_CONFIG = [
  { value: 'all', label: 'All Events', icon: Sparkles, color: 'from-purple-500 to-pink-500', emoji: '✨' },
  { value: 'music', label: 'Music', icon: Music, color: 'from-pink-500 to-rose-500', emoji: '🎵' },
  { value: 'technology', label: 'Technology', icon: Zap, color: 'from-blue-500 to-cyan-500', emoji: '💻' },
  { value: 'art', label: 'Art & Culture', icon: Palette, color: 'from-amber-500 to-orange-500', emoji: '🎨' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'from-green-500 to-emerald-500', emoji: '📚' },
  { value: 'food', label: 'Food & Drink', icon: Utensils, color: 'from-red-500 to-pink-500', emoji: '🍽️' },
  { value: 'sports', label: 'Sports & Fitness', icon: Dumbbell, color: 'from-sky-500 to-blue-500', emoji: '⚡' },
  { value: 'business', label: 'Business', icon: Briefcase, color: 'from-slate-400 to-gray-500', emoji: '💼' },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'from-violet-500 to-purple-500', emoji: '🎮' },
  { value: 'community', label: 'Community', icon: Globe, color: 'from-teal-500 to-green-500', emoji: '🌍' },
];

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date: Soonest First' },
  { value: 'date_desc', label: 'Date: Latest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'trending', label: 'Trending' },
];

const QUICK_FILTERS = [
  { label: 'Today', value: 'today', icon: Calendar },
  { label: 'This Week', value: 'this_week', icon: CalendarDays },
  { label: 'Free Events', value: 'free', icon: Ticket },
  { label: 'Trending', value: 'trending', icon: Flame },
  { label: 'Featured', value: 'featured', icon: Star },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getEventStatus(event) {
  const now = new Date();
  const startDate = new Date(event.start_date || event.date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  if (endDate && isBefore(endDate, now)) return 'completed';
  if (isBefore(startDate, now) && (!endDate || isAfter(endDate, now))) return 'live';
  return 'upcoming';
}

function getStatusConfig(status) {
  const configs = {
    live: {
      label: 'Live Now',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pulse: true,
    },
    completed: {
      label: 'Ended',
      className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      pulse: false,
    },
    upcoming: {
      label: 'Upcoming',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pulse: false,
    },
  };
  return configs[status] || configs.upcoming;
}

function formatEventDate(dateStr) {
  if (!dateStr) return 'Date TBA';
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today · ${format(date, 'h:mm a')}`;
    return format(date, 'EEE, MMM d, yyyy');
  } catch {
    return 'Date TBA';
  }
}

function formatPrice(price) {
  if (!price || price === 0) return 'Free';
  return `$${price.toLocaleString()}`;
}

function getTimeUntil(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isBefore(date, new Date())) return null;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return null;
  }
}

function getAvailabilityPercentage(available, total) {
  if (!total || total === 0) return 100;
  return Math.round((available / total) * 100);
}

function getAvailabilityColor(percentage) {
  if (percentage <= 10) return 'text-red-400';
  if (percentage <= 30) return 'text-amber-400';
  return 'text-emerald-400';
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  // ── State ───────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_asc');
  const [viewMode, setViewMode] = useState('grid');
  const [quickFilter, setQuickFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // ── Debounced Search ────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Load Mock Data ──────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1000));
      setEvents(MOCK_EVENTS);
      setLoading(false);
    };
    loadData();
  }, []);

  // ── Search Suggestions ─────────────────────────────────
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = MOCK_EVENTS.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
    ).slice(0, 5);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, [searchQuery]);

  // ── Click outside suggestions ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── URL Sync ───────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'date_asc') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, sortBy, setSearchParams]);

  // ── Filtering & Sorting ────────────────────────────────
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // Price
    if (priceFilter === 'free') {
      result = result.filter((e) => !e.price || e.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter((e) => e.price && e.price > 0);
    }

    // Status
    if (statusFilter !== 'all') {
      result = result.filter((e) => getEventStatus(e) === statusFilter);
    }

    // Quick Filters
    if (quickFilter === 'today') {
      result = result.filter((e) => isToday(new Date(e.start_date || e.date)));
    } else if (quickFilter === 'this_week') {
      result = result.filter((e) => isThisWeek(new Date(e.start_date || e.date)));
    } else if (quickFilter === 'free') {
      result = result.filter((e) => !e.price || e.price === 0);
    } else if (quickFilter === 'trending') {
      result = result.filter((e) => e.view_count > 5000);
    } else if (quickFilter === 'featured') {
      result = result.filter((e) => e.is_featured);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.start_date || b.date) - new Date(a.start_date || a.date);
        case 'popular':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'trending':
          return (b.attendees_count || 0) - (a.attendees_count || 0);
        case 'date_asc':
        default:
          return new Date(a.start_date || a.date) - new Date(b.start_date || b.date);
      }
    });

    return result;
  }, [events, debouncedSearch, selectedCategory, priceFilter, statusFilter, quickFilter, sortBy]);

  // ── Category Counts ────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts = { all: events.length };
    events.forEach((e) => {
      const cat = e.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [events]);

  // ── Active Filter Count ────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (selectedCategory !== 'all') count++;
    if (priceFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (quickFilter) count++;
    return count;
  }, [debouncedSearch, selectedCategory, priceFilter, statusFilter, quickFilter]);

  // ── Handlers ───────────────────────────────────────────
  const handleToggleSave = (eventId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setSavedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        toast.success('Removed from saved events');
      } else {
        next.add(eventId);
        toast.success('Event saved!');
      }
      return next;
    });
  };

  const handleShare = async (event, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: `Check out: ${event.title}`, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied!');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSortBy('date_asc');
    setQuickFilter('');
    setPriceFilter('all');
    setStatusFilter('all');
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* ═══════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 overflow-hidden border-b border-slate-800/50">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]"
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-cyan-600/8 rounded-full blur-[80px]"
            animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-5 px-4 py-1.5 bg-purple-500/15 text-purple-400 border-purple-500/25 backdrop-blur-sm text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                Discover Events Near You
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
                Find Your Next
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Unforgettable Experience
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Explore {events.length > 0 ? `${events.length}+` : ''} curated events — concerts,
                workshops, meetups, conferences, and more happening around you.
              </p>

              {/* ── Search Bar ─────────────────────────────── */}
              <div className="relative max-w-2xl mx-auto" ref={searchInputRef}>
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                    <Input
                      placeholder="Search events, venues, artists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      className="pl-12 pr-12 h-14 text-base sm:text-lg bg-slate-900/80 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-500 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.querySelector('input')?.focus();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* ── Search Suggestions ────────────────────── */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                    >
                      <div className="py-1">
                        <p className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Quick Results
                        </p>
                        {suggestions.map((item) => {
                          const catConfig = CATEGORY_CONFIG.find((c) => c.value === item.category);
                          return (
                            <button
                              key={item.id}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/60 transition-colors text-left group"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                navigate(`/events/${item.id}`);
                                setShowSuggestions(false);
                              }}
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                {item.image_url ? (
                                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">
                                    {catConfig?.emoji || '📅'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {formatEventDate(item.start_date || item.date)}
                                  {item.location && (
                                    <>
                                      <span className="text-slate-700">·</span>
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">{item.location}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Quick Filter Pills ────────────────────── */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {QUICK_FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = quickFilter === filter.value;
                  return (
                    <Button
                      key={filter.value}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'rounded-full border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200',
                        isActive &&
                          'bg-purple-600/20 border-purple-500/40 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300 hover:border-purple-500/50'
                      )}
                      onClick={() => setQuickFilter((prev) => (prev === filter.value ? '' : filter.value))}
                    >
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {filter.label}
                      {isActive && <X className="w-3 h-3 ml-1.5" />}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STICKY CATEGORIES BAR
          ═══════════════════════════════════════════════════ */}
      <section className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative">
            {/* Fade indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950/80 to-transparent z-10 pointer-events-none" />

            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide px-1">
              {CATEGORY_CONFIG.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.value;
                const count = categoryCounts[cat.value] || 0;

                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setQuickFilter('');
                    }}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0',
                      isActive
                        ? 'text-white shadow-lg'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    )}
                  >
                    {/* Active background gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategory"
                        className={cn('absolute inset-0 rounded-full bg-gradient-to-r', cat.color)}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-500'
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════ */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          {/* ── Toolbar ──────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Sheet */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white relative"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-slate-950 border-slate-800 w-[340px] sm:w-[380px]">
                  <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                      Filter Events
                    </SheetTitle>
                    <SheetDescription className="text-slate-400">
                      Narrow down results to find the perfect event
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-8 space-y-8 pb-24">
                    {/* Category Grid */}
                    <div>
                      <label className="text-sm font-semibold text-white mb-3 block">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORY_CONFIG.map((cat) => {
                          const Icon = cat.icon;
                          const isActive = selectedCategory === cat.value;
                          return (
                            <button
                              key={cat.value}
                              onClick={() => setSelectedCategory(cat.value)}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                                isActive
                                  ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                              )}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    {/* Price Filter */}
                    <div>
                      <label className="text-sm font-semibold text-white mb-3 block">Price</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'all', label: 'All', icon: null },
                          { value: 'free', label: 'Free', icon: Ticket },
                          { value: 'paid', label: 'Paid', icon: Tag },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setPriceFilter(opt.value)}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                              priceFilter === opt.value
                                ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                            )}
                          >
                            {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-semibold text-white mb-3 block">Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'all', label: 'All' },
                          { value: 'upcoming', label: 'Upcoming' },
                          { value: 'live', label: 'Live Now' },
                          { value: 'completed', label: 'Past' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={cn(
                              'px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-center',
                              statusFilter === opt.value
                                ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fixed bottom buttons */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-950">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={clearAllFilters}
                      >
                        Reset All
                      </Button>
                      <Button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setShowFilters(false)}
                      >
                        Show Results ({filteredEvents.length})
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[190px] h-9 bg-slate-900/50 border-slate-700/50 text-slate-300 text-sm">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-slate-300 focus:bg-slate-800 focus:text-white"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Count */}
              <p className="text-sm text-slate-500 hidden sm:block">
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`
                )}
              </p>
            </div>

            {/* View Toggle */}
            <TooltipProvider>
              <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-700/50 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8 rounded-md transition-all',
                        viewMode === 'grid'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      )}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Grid View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8 rounded-md transition-all',
                        viewMode === 'list'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      )}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">List View</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* ── Active Filter Tags ────────────────────────── */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 mb-6"
              >
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Filters:
                </span>
                {debouncedSearch && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 border-slate-700 gap-1.5 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    <Search className="w-3 h-3" />
                    "{debouncedSearch}"
                    <X className="w-3 h-3 ml-0.5" />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 border-slate-700 gap-1.5 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setSelectedCategory('all')}
                  >
                    {CATEGORY_CONFIG.find((c) => c.value === selectedCategory)?.emoji}{' '}
                    {CATEGORY_CONFIG.find((c) => c.value === selectedCategory)?.label || selectedCategory}
                    <X className="w-3 h-3 ml-0.5" />
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 border-slate-700 gap-1.5 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setPriceFilter('all')}
                  >
                    <Ticket className="w-3 h-3" />
                    {priceFilter === 'free' ? 'Free' : 'Paid'}
                    <X className="w-3 h-3 ml-0.5" />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 border-slate-700 gap-1.5 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setStatusFilter('all')}
                  >
                    {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <X className="w-3 h-3 ml-0.5" />
                  </Badge>
                )}
                {quickFilter && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800/80 text-slate-300 border-slate-700 gap-1.5 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setQuickFilter('')}
                  >
                    <Flame className="w-3 h-3" />
                    {QUICK_FILTERS.find((q) => q.value === quickFilter)?.label}
                    <X className="w-3 h-3 ml-0.5" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-red-400 h-6 px-2"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════
              EVENTS DISPLAY
              ═══════════════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                    : 'space-y-4'
                )}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <EventCardSkeleton key={i} viewMode={viewMode} index={i} />
                ))}
              </motion.div>
            )}

            {/* Empty */}
            {!loading && filteredEvents.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No events found</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                  {activeFilterCount > 0
                    ? "We couldn't find events matching your criteria. Try adjusting your filters."
                    : 'No events are available right now. Check back soon for new events!'}
                </p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearAllFilters} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            )}

            {/* Events */}
            {!loading && filteredEvents.length > 0 && (
              <motion.div
                key="events"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                    : 'space-y-3'
                )}
              >
                {filteredEvents.map((event) => (
                  <motion.div key={event.id} variants={itemVariants} layout>
                    {viewMode === 'grid' ? (
                      <EventGridCard
                        event={event}
                        isSaved={savedEvents.has(event.id)}
                        onToggleSave={handleToggleSave}
                        onShare={handleShare}
                        onClick={() => navigate(`/events/${event.id}`)}
                      />
                    ) : (
                      <EventListCard
                        event={event}
                        isSaved={savedEvents.has(event.id)}
                        onToggleSave={handleToggleSave}
                        onShare={handleShare}
                        onClick={() => navigate(`/events/${event.id}`)}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

// ============================================================
// EVENT GRID CARD (inline component)
// ============================================================
function EventGridCard({ event, isSaved, onToggleSave, onShare, onClick }) {
  const status = getEventStatus(event);
  const statusConfig = getStatusConfig(status);
  const timeUntil = getTimeUntil(event.start_date || event.date);
  const imageUrl = event.image_url || event.banner_url;
  const catConfig = CATEGORY_CONFIG.find((c) => c.value === event.category);
  const availability = getAvailabilityPercentage(event.available_tickets, event.max_attendees);

  return (
    <Card
      className="group relative overflow-hidden bg-slate-900/60 border-slate-800/50 hover:border-slate-700/80 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Featured ribbon */}
      {event.is_featured && (
        <div className="absolute top-3 left-0 z-20">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-r-full shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            FEATURED
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-4xl">{catConfig?.emoji || '📅'}</span>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-right: Action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => onToggleSave(event.id, e)}
            className={cn(
              'w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-lg',
              isSaved
                ? 'bg-pink-500 text-white scale-110'
                : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
            )}
          >
            <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>
          <button
            onClick={(e) => onShare(event, e)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-left: Price */}
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg',
              !event.price || event.price === 0
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                : 'bg-black/50 text-white border border-white/10'
            )}
          >
            {formatPrice(event.price)}
          </span>
        </div>

        {/* Bottom-right: Status */}
        <div className="absolute bottom-3 right-3">
          <Badge className={cn('text-[10px] font-semibold backdrop-blur-md', statusConfig.className)}>
            {statusConfig.pulse && (
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            )}
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Category + countdown */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-widest border-slate-700/50 text-slate-500 font-semibold bg-slate-800/30"
          >
            {catConfig?.emoji} {catConfig?.label || event.category}
          </Badge>
          {timeUntil && status === 'upcoming' && (
            <span className="text-[11px] text-purple-400/80 flex items-center gap-1 font-medium">
              <Timer className="w-3 h-3" />
              {timeUntil}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors duration-300 text-[15px]">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{event.description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{formatEventDate(event.start_date || event.date)}</span>
            {event.start_time && (
              <>
                <span className="text-slate-700">·</span>
                <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span>{event.start_time}</span>
              </>
            )}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Attendance bar */}
        {event.max_attendees && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.attendees_count?.toLocaleString() || 0} attending
              </span>
              <span className={cn('font-medium', getAvailabilityColor(availability))}>
                {event.available_tickets?.toLocaleString() || 0} spots left
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  availability <= 10
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : availability <= 30
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${100 - availability}%` }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-4 pt-0">
        <Button
          className="w-full bg-slate-800 hover:bg-purple-600 text-white text-sm transition-all duration-300 group-hover:bg-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/20 rounded-xl h-10"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================
// EVENT LIST CARD (inline component)
// ============================================================
function EventListCard({ event, isSaved, onToggleSave, onShare, onClick }) {
  const status = getEventStatus(event);
  const statusConfig = getStatusConfig(status);
  const timeUntil = getTimeUntil(event.start_date || event.date);
  const imageUrl = event.image_url || event.banner_url;
  const catConfig = CATEGORY_CONFIG.find((c) => c.value === event.category);
  const availability = getAvailabilityPercentage(event.available_tickets, event.max_attendees);

  return (
    <Card
      className="group overflow-hidden bg-slate-900/60 border-slate-800/50 hover:border-slate-700/80 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-500/5"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-56 md:w-64 lg:w-72 flex-shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full min-h-[140px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-3xl">{catConfig?.emoji || '📅'}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />

          {/* Featured */}
          {event.is_featured && (
            <div className="absolute top-2 left-0">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-r-full flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" />
                FEATURED
              </div>
            </div>
          )}

          {/* Price */}
          <div className="absolute bottom-2 left-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md',
                !event.price || event.price === 0
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                  : 'bg-black/50 text-white border border-white/10'
              )}
            >
              {formatPrice(event.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-slate-700/50 text-slate-500 font-semibold"
              >
                {catConfig?.emoji} {catConfig?.label || event.category}
              </Badge>
              <Badge className={cn('text-[10px] font-semibold', statusConfig.className)}>
                {statusConfig.pulse && (
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                )}
                {statusConfig.label}
              </Badge>
              {timeUntil && status === 'upcoming' && (
                <span className="text-[11px] text-purple-400/80 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {timeUntil}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => onToggleSave(event.id, e)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isSaved
                    ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                    : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                )}
              >
                <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
              </button>
              <button
                onClick={(e) => onShare(event, e)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatEventDate(event.start_date || event.date)}</span>
              {event.start_time && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{event.start_time}</span>
                </>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </div>
            )}
            {event.attendees_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{event.attendees_count?.toLocaleString()} attending</span>
              </div>
            )}
            {event.view_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{event.view_count?.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-500 border border-slate-700/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-4">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/10 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            {event.max_attendees && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      availability <= 10
                        ? 'bg-red-500'
                        : availability <= 30
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    )}
                    style={{ width: `${100 - availability}%` }}
                  />
                </div>
                <span className={cn('text-[11px] font-medium', getAvailabilityColor(availability))}>
                  {event.available_tickets} left
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// SKELETON COMPONENT
// ============================================================
function EventCardSkeleton({ viewMode, index }) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="overflow-hidden bg-slate-900/50 border-slate-800/50">
          <div className="flex flex-col sm:flex-row">
            <Skeleton className="w-full sm:w-56 md:w-64 aspect-video sm:aspect-auto sm:min-h-[160px] bg-slate-800/80" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 bg-slate-800/80 rounded-full" />
                <Skeleton className="h-5 w-16 bg-slate-800/80 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 bg-slate-800/80 rounded" />
              <Skeleton className="h-4 w-full bg-slate-800/80 rounded" />
              <Skeleton className="h-4 w-2/3 bg-slate-800/80 rounded" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-4 w-32 bg-slate-800/80 rounded" />
                <Skeleton className="h-4 w-28 bg-slate-800/80 rounded" />
              </div>
              <Skeleton className="h-9 w-28 bg-slate-800/80 rounded-xl mt-2" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden bg-slate-900/50 border-slate-800/50">
        <Skeleton className="aspect-[16/10] bg-slate-800/80" />
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20 bg-slate-800/80 rounded-full" />
            <Skeleton className="h-4 w-16 bg-slate-800/80 rounded" />
          </div>
          <Skeleton className="h-5 w-4/5 bg-slate-800/80 rounded" />
          <Skeleton className="h-4 w-full bg-slate-800/80 rounded" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-40 bg-slate-800/80 rounded" />
            <Skeleton className="h-3.5 w-32 bg-slate-800/80 rounded" />
          </div>
          <Skeleton className="h-1.5 w-full bg-slate-800/80 rounded-full mt-2" />
          <Skeleton className="h-10 w-full bg-slate-800/80 rounded-xl mt-1" />
        </div>
      </Card>
    </motion.div>
  );
}

export default EventsPage;
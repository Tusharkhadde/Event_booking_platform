// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Calendar,
//   MapPin,
//   Users,
//   Star,
//   ArrowRight,
//   Heart,
//   PartyPopper,
//   Music,
//   Briefcase,
//   UserCheck,
//   Building2,
//   Sparkles,
//   CheckCircle,
//   Play,
//   LayoutDashboard,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { useFeaturedEvents } from '@/hooks/useEvents';
// import { formatDate, getStatusColor } from '@/utils/helpers';
// import useAuthStore from '@/store/authStore';
// import EmptyState from '@/components/common/EmptyState';

// function HomePage() {
//   const navigate = useNavigate();
//   const { isAuthenticated, profile } = useAuthStore();
//   const { data: featuredEvents, isLoading } = useFeaturedEvents(6);
//   const [showRoleDialog, setShowRoleDialog] = useState(false);

//   const getDashboardLink = () => {
//     const role = profile?.role;
//     if (role === 'admin') return '/admin/dashboard';
//     if (role === 'organizer') return '/organizer/dashboard';
//     if (role === 'vendor') return '/vendor/dashboard';
//     return '/dashboard';
//   };

//   const handleGetStarted = () => {
//     if (isAuthenticated) {
//       navigate(getDashboardLink());
//     } else {
//       setShowRoleDialog(true);
//     }
//   };

//   const roleOptions = [
//     {
//       id: 'customer',
//       title: 'Attend Events',
//       subtitle: 'I want to discover and book events',
//       icon: UserCheck,
//       color: 'bg-blue-500',
//       features: [
//         'Browse all public events',
//         'Book tickets for events',
//         'RSVP to private invitations',
//         'Save favorite events',
//         'Manage your bookings',
//       ],
//     },
//     {
//       id: 'organizer',
//       title: 'Organize Events',
//       subtitle: 'I want to create and manage events',
//       icon: Calendar,
//       color: 'bg-purple-500',
//       features: [
//         'Create unlimited events',
//         'Set custom ticket pricing',
//         'Manage guest lists & RSVPs',
//         'Hire and manage vendors',
//         'Full event analytics',
//       ],
//     },
//     {
//       id: 'vendor',
//       title: 'Offer Services',
//       subtitle: 'I provide event services',
//       icon: Building2,
//       color: 'bg-green-500',
//       features: [
//         'List your services',
//         'Receive booking requests',
//         'Manage availability',
//         'Get paid for services',
//         'Build your reputation',
//       ],
//     },
//   ];

//   return (
//     <div className="flex flex-col">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
//         <div className="container relative z-10">
//           <div className="mx-auto max-w-4xl text-center">
//             <Badge className="mb-4 px-4 py-1" variant="secondary">
//               <Sparkles className="mr-1 h-3 w-3" />
//               Your Complete Event Solution
//             </Badge>
//             <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
//               Plan Perfect Events with{' '}
//               <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
//                 EventSphere
//               </span>
//             </h1>
//             <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
//               Whether you're attending a concert, organizing a wedding, or offering catering services - 
//               EventSphere brings everyone together in one powerful platform.
//             </p>
//             <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
//               <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
//                 {isAuthenticated ? (
//                   <>
//                     <LayoutDashboard className="mr-2 h-5 w-5" />
//                     Go to Dashboard
//                   </>
//                 ) : (
//                   <>
//                     Get Started Free
//                     <ArrowRight className="ml-2 h-5 w-5" />
//                   </>
//                 )}
//               </Button>
//               <Button size="lg" variant="outline" className="text-lg px-8" asChild>
//                 <Link to="/events">
//                   <Play className="mr-2 h-5 w-5" />
//                   Explore Events
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//         {/* Decorative elements */}
//         <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
//         <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
//         <div className="absolute top-40 right-1/4 h-24 w-24 rounded-full bg-pink-500/20 blur-3xl" />
//       </section>

//       {/* Role Section - ONLY SHOW IF NOT LOGGED IN */}
//       {!isAuthenticated && (
//         <section className="py-20 bg-muted/30">
//           <div className="container">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold mb-4">Who is EventSphere For?</h2>
//               <p className="text-muted-foreground max-w-2xl mx-auto">
//                 Choose your path and unlock features designed specifically for you
//               </p>
//             </div>

//             <div className="grid gap-6 md:grid-cols-3">
//               {roleOptions.map((role) => {
//                 const Icon = role.icon;
//                 return (
//                   <Card
//                     key={role.id}
//                     className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
//                     onClick={() => navigate(`/register?role=${role.id}`)}
//                   >
//                     <div className={`absolute top-0 left-0 right-0 h-1 ${role.color}`} />
//                     <CardHeader className="text-center pb-2">
//                       <div
//                         className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${role.color} text-white transition-transform group-hover:scale-110`}
//                       >
//                         <Icon className="h-8 w-8" />
//                       </div>
//                       <CardTitle className="text-xl">{role.title}</CardTitle>
//                       <CardDescription>{role.subtitle}</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <ul className="space-y-2">
//                         {role.features.map((feature, idx) => (
//                           <li key={idx} className="flex items-center gap-2 text-sm">
//                             <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
//                             <span>{feature}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </CardContent>
//                     <CardFooter>
//                       <Button className="w-full" variant="outline">
//                         Get Started as {role.title.split(' ')[0]}
//                         <ArrowRight className="ml-2 h-4 w-4" />
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Stats Section */}
//       <section className="border-y bg-background py-12">
//         <div className="container">
//           <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
//             <StatCard number="10" label="Events Hosted" icon={Calendar} />
//             <StatCard number="50,000+" label="Happy Attendees" icon={Users} />
//             <StatCard number="500+" label="Verified Vendors" icon={Building2} />
//             <StatCard number="9%" label="Satisfaction Rate" icon={Star} />
//           </div>
//         </div>
//       </section>

//       {/* Event Types Section */}
//       <section className="py-20">
//         <div className="container">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-4">Perfect for Every Occasion</h2>
//             <p className="text-muted-foreground">
//               From intimate gatherings to grand celebrations
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//             <EventTypeCard
//               icon={Heart}
//               title="Weddings"
//               description="Plan your perfect day"
//               color="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400"
//             />
//             <EventTypeCard
//               icon={PartyPopper}
//               title="Parties"
//               description="Birthday, Anniversary & more"
//               color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
//             />
//             <EventTypeCard
//               icon={Music}
//               title="Concerts"
//               description="Live music experiences"
//               color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
//             />
//             <EventTypeCard
//               icon={Briefcase}
//               title="Corporate"
//               description="Conferences & meetings"
//               color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Featured Events Section */}
//       <section className="bg-muted/30 py-20">
//         <div className="container">
//           <div className="mb-12 flex items-center justify-between">
//             <div>
//               <h2 className="mb-2 text-3xl font-bold">Upcoming Events</h2>
//               <p className="text-muted-foreground">
//                 Discover amazing events happening near you
//               </p>
//             </div>
//             <Button variant="outline" asChild>
//               <Link to="/events">
//                 View All Events
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>

//           {isLoading && <EventsGridSkeleton />}

//           {!isLoading && featuredEvents?.length === 0 && (
//             <EmptyState
//               icon={Calendar}
//               title="No events yet"
//               description="Be the first to create an event!"
//             />
//           )}

//           {!isLoading && featuredEvents?.length > 0 && (
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {featuredEvents.map((event) => (
//                 <EventCard key={event.id} event={event} />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Organizer Features - ONLY SHOW IF NOT LOGGED IN */}
//       {!isAuthenticated && (
//         <section className="py-20">
//           <div className="container">
//             <div className="grid gap-12 lg:grid-cols-2 items-center">
//               <div>
//                 <Badge className="mb-4" variant="secondary">
//                   For Event Organizers
//                 </Badge>
//                 <h2 className="text-3xl font-bold mb-4">
//                   Full Control Over Your Events
//                 </h2>
//                 <p className="text-muted-foreground mb-6">
//                   As an organizer, you have complete control over every aspect of your event - 
//                   from setting ticket prices to managing vendors and guest lists.
//                 </p>
//                 <ul className="space-y-4">
//                   <FeatureItem
//                     title="Custom Ticket Pricing"
//                     description="Set different prices for Normal, VIP, and VVIP tickets"
//                   />
//                   <FeatureItem
//                     title="Guest Management"
//                     description="Invite guests, track RSVPs, and manage seating"
//                   />
//                   <FeatureItem
//                     title="Vendor Hiring"
//                     description="Browse and hire caterers, decorators, photographers & more"
//                   />
//                   <FeatureItem
//                     title="Private Events"
//                     description="Create invitation-only events for weddings & family functions"
//                   />
//                 </ul>
//                 <Button className="mt-6" asChild>
//                   <Link to="/register?role=organizer">
//                     Start Organizing
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Link>
//                 </Button>
//               </div>
//               <div className="relative">
//                 <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-8">
//                   <div className="h-full w-full rounded-xl bg-background shadow-xl p-6 space-y-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
//                         <Calendar className="h-5 w-5 text-primary" />
//                       </div>
//                       <div>
//                         <p className="font-semibold">Wedding Reception</p>
//                         <p className="text-sm text-muted-foreground">Private Event</p>
//                       </div>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between p-3 bg-muted rounded-lg">
//                         <span>Normal Guest</span>
//                         <span className="font-bold text-green-600">$50</span>
//                       </div>
//                       <div className="flex justify-between p-3 bg-muted rounded-lg">
//                         <span>VIP Guest</span>
//                         <span className="font-bold text-blue-600">$150</span>
//                       </div>
//                       <div className="flex justify-between p-3 bg-muted rounded-lg">
//                         <span>VVIP Guest</span>
//                         <span className="font-bold text-purple-600">$300</span>
//                       </div>
//                     </div>
//                     <Badge className="w-full justify-center py-2">
//                       Only You Control Pricing
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* CTA Section - Show only if not logged in */}
//       {!isAuthenticated && (
//         <section className="bg-primary py-20 text-primary-foreground">
//           <div className="container text-center">
//             <h2 className="mb-4 text-3xl font-bold md:text-4xl">
//               Ready to Create Amazing Events?
//             </h2>
//             <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">
//               Join thousands of organizers, attendees, and vendors who trust EventSphere
//             </p>
//             <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
//               <Button
//                 size="lg"
//                 variant="secondary"
//                 onClick={handleGetStarted}
//                 className="text-lg"
//               >
//                 Get Started Free
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
//                 asChild
//               >
//                 <Link to="/events">Explore Events</Link>
//               </Button>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Role Selection Dialog */}
//       <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="text-2xl text-center">
//               How do you want to use EventSphere?
//             </DialogTitle>
//             <DialogDescription className="text-center">
//               Choose your primary role to get started
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 md:grid-cols-3 py-4">
//             {roleOptions.map((role) => {
//               const Icon = role.icon;
//               return (
//                 <Card
//                   key={role.id}
//                   className="cursor-pointer hover:border-primary transition-colors"
//                   onClick={() => {
//                     setShowRoleDialog(false);
//                     navigate(`/register?role=${role.id}`);
//                   }}
//                 >
//                   <CardContent className="p-6 text-center">
//                     <div
//                       className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${role.color} text-white`}
//                     >
//                       <Icon className="h-7 w-7" />
//                     </div>
//                     <h3 className="font-semibold mb-1">{role.title}</h3>
//                     <p className="text-sm text-muted-foreground">{role.subtitle}</p>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//           <div className="text-center text-sm text-muted-foreground">
//             Already have an account?{' '}
//             <Link
//               to="/login"
//               className="text-primary hover:underline"
//               onClick={() => setShowRoleDialog(false)}
//             >
//               Log in
//             </Link>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // Sub-components... (Keeping other existing sub-components the same)
// function StatCard({ number, label, icon: Icon }) {
//   return (
//     <div className="text-center">
//       <div className="flex items-center justify-center gap-2 mb-2">
//         <Icon className="h-6 w-6 text-primary" />
//         <span className="text-3xl font-bold md:text-4xl">{number}</span>
//       </div>
//       <p className="text-sm text-muted-foreground">{label}</p>
//     </div>
//   );
// }

// function EventTypeCard({ icon: Icon, title, description, color }) {
//   return (
//     <Link to={`/events?category=${title.toLowerCase()}`}>
//       <Card className="hover:shadow-md transition-all cursor-pointer group">
//         <CardContent className="p-6 text-center">
//           <div
//             className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color} transition-transform group-hover:scale-110`}
//           >
//             <Icon className="h-7 w-7" />
//           </div>
//           <h3 className="font-semibold mb-1">{title}</h3>
//           <p className="text-sm text-muted-foreground">{description}</p>
//         </CardContent>
//       </Card>
//     </Link>
//   );
// }

// function FeatureItem({ title, description }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
//         <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
//       </div>
//       <div>
//         <h4 className="font-medium">{title}</h4>
//         <p className="text-sm text-muted-foreground">{description}</p>
//       </div>
//     </div>
//   );
// }

// function EventCard({ event }) {
//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-all group">
//       <div className="aspect-video overflow-hidden bg-muted">
//         {event.banner_url && (
//           <img
//             src={event.banner_url}
//             alt={event.title}
//             className="h-full w-full object-cover transition-transform group-hover:scale-105"
//           />
//         )}
//         {!event.banner_url && (
//           <div className="flex h-full items-center justify-center">
//             <Calendar className="h-12 w-12 text-muted-foreground" />
//           </div>
//         )}
//       </div>
//       <CardHeader className="pb-2">
//         <div className="flex items-start justify-between">
//           <Badge variant="secondary" className="capitalize">
//             {event.category}
//           </Badge>
//           <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="pb-2">
//         <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{event.title}</h3>
//         <div className="space-y-1 text-sm text-muted-foreground">
//           <div className="flex items-center gap-2">
//             <Calendar className="h-4 w-4" />
//             <span>{formatDate(event.date)}</span>
//           </div>
//           {event.location && (
//             <div className="flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               <span className="line-clamp-1">{event.location}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter>
//         <Button className="w-full" asChild>
//           <Link to={`/events/${event.id}`}>View Details</Link>
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

// function EventsGridSkeleton() {
//   return (
//     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//       {[1, 2, 3, 4, 5, 6].map((i) => (
//         <Card key={i} className="overflow-hidden">
//           <Skeleton className="aspect-video" />
//           <CardHeader className="pb-2">
//             <Skeleton className="h-5 w-20" />
//           </CardHeader>
//           <CardContent className="pb-2">
//             <Skeleton className="mb-2 h-6 w-3/4" />
//             <Skeleton className="mb-1 h-4 w-1/2" />
//             <Skeleton className="h-4 w-2/3" />
//           </CardContent>
//           <CardFooter>
//             <Skeleton className="h-10 w-full" />
//           </CardFooter>
//         </Card>
//       ))}
//     </div>
//   );
// }

// export default HomePage;
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowRight,
  Heart,
  PartyPopper,
  Music,
  Briefcase,
  UserCheck,
  Building2,
  Sparkles,
  CheckCircle,
  Play,
  LayoutDashboard,
  Zap,
  Shield,
  Trophy,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import EmptyState from '@/components/common/EmptyState';

gsap.registerPlugin(ScrollTrigger);

// Custom SplitText Component
function SplitText({ children, className = '', delay = 0 }) {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const text = element.innerText;
    element.innerHTML = '';

    const chars = text.split('').map((char, i) => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(100px) rotateX(-90deg)';
      span.className = 'split-char';
      element.appendChild(span);
      return span;
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.02,
      delay: delay,
      ease: 'power4.out',
    });

    return () => {
      element.innerHTML = text;
    };
  }, [children, delay]);

  return (
    <span ref={textRef} className={className}>
      {children}
    </span>
  );
}

// Animated Background Grid
function VengeanceGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
    </div>
  );
}

// Floating Particles
function FloatingParticles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const particles = containerRef.current?.querySelectorAll('.particle');
    particles?.forEach((particle, i) => {
      gsap.to(particle, {
        y: 'random(-100, 100)',
        x: 'random(-50, 50)',
        rotation: 'random(-180, 180)',
        duration: 'random(3, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.2,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

// Glitch Text Effect
function GlitchText({ children, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 -translate-x-[2px] text-red-500/50 animate-pulse"
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 translate-x-[2px] text-cyan-500/50 animate-pulse"
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuthStore();
  const { data: featuredEvents, isLoading } = useFeaturedEvents(6);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const rolesRef = useRef(null);
  const eventTypesRef = useRef(null);
  const featuredRef = useRef(null);
  const organizerRef = useRef(null);
  const ctaRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Custom cursor effect
    const moveCursor = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    };
    window.addEventListener('mousemove', moveCursor);

    // Hero animations
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
      .from(
        '.hero-subtitle',
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
        },
        '-=0.4'
      )
      .from(
        '.hero-buttons > *',
        {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.6,
        },
        '-=0.4'
      )
      .from(
        '.hero-decor',
        {
          scale: 0,
          opacity: 0,
          stagger: 0.2,
          duration: 1,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.8'
      );

    // Stats counter animation
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.stat-card', {
          opacity: 0,
          y: 50,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        });
        // Animate numbers
        document.querySelectorAll('.stat-number').forEach((el) => {
          const target = parseInt(el.dataset.target || '0');
          gsap.to(el, {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out',
          });
        });
      },
      once: true,
    });

    // Role cards animation
    if (rolesRef.current) {
      ScrollTrigger.create({
        trigger: rolesRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.role-card', {
            opacity: 0,
            y: 100,
            rotateY: -30,
            stagger: 0.15,
            duration: 1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    }

    // Event types animation
    ScrollTrigger.create({
      trigger: eventTypesRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.event-type-card', {
          opacity: 0,
          scale: 0.5,
          rotation: -10,
          stagger: 0.1,
          duration: 0.8,
          ease: 'back.out(1.7)',
        });
      },
      once: true,
    });

    // Featured events animation
    ScrollTrigger.create({
      trigger: featuredRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.featured-card', {
          opacity: 0,
          y: 80,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        });
      },
      once: true,
    });

    // Organizer section parallax
    if (organizerRef.current) {
      gsap.to('.organizer-visual', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: organizerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // CTA section animation
    if (ctaRef.current) {
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.cta-content > *', {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
          });
        },
        once: true,
      });
    }

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isAuthenticated]);

  const getDashboardLink = () => {
    const role = profile?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'organizer') return '/organizer/dashboard';
    if (role === 'vendor') return '/vendor/dashboard';
    return '/dashboard';
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(getDashboardLink());
    } else {
      setShowRoleDialog(true);
    }
  };

  const roleOptions = [
    {
      id: 'customer',
      title: 'Attend Events',
      subtitle: 'I want to discover and book events',
      icon: UserCheck,
      color: 'from-blue-600 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
      features: [
        'Browse all public events',
        'Book tickets for events',
        'RSVP to private invitations',
        'Save favorite events',
        'Manage your bookings',
      ],
    },
    {
      id: 'organizer',
      title: 'Organize Events',
      subtitle: 'I want to create and manage events',
      icon: Calendar,
      color: 'from-purple-600 to-pink-500',
      glowColor: 'shadow-purple-500/50',
      features: [
        'Create unlimited events',
        'Set custom ticket pricing',
        'Manage guest lists & RSVPs',
        'Hire and manage vendors',
        'Full event analytics',
      ],
    },
    {
      id: 'vendor',
      title: 'Offer Services',
      subtitle: 'I provide event services',
      icon: Building2,
      color: 'from-green-600 to-emerald-500',
      glowColor: 'shadow-green-500/50',
      features: [
        'List your services',
        'Receive booking requests',
        'Manage availability',
        'Get paid for services',
        'Build your reputation',
      ],
    },
  ];

  return (
    <div className="flex flex-col bg-background relative overflow-hidden">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-6 h-6 border-2 border-primary rounded-full pointer-events-none z-50 mix-blend-difference hidden lg:block"
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      {/* Hero Section - Vengeance Style */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-background to-background"
      >
        <VengeanceGrid />
        <FloatingParticles />

        {/* Animated gradient orbs */}
        <div className="hero-decor absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-gradient-to-r from-primary/40 to-purple-600/40 blur-[100px] animate-pulse" />
        <div className="hero-decor absolute bottom-[20%] right-[10%] h-80 w-80 rounded-full bg-gradient-to-r from-pink-500/30 to-orange-500/30 blur-[120px] animate-pulse" />
        <div className="hero-decor absolute top-[40%] right-[30%] h-48 w-48 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-[80px]" />

        {/* Sharp geometric decorations */}
        <div className="hero-decor absolute top-20 left-20 w-20 h-20 border border-primary/30 rotate-45 animate-spin-slow" />
        <div className="hero-decor absolute bottom-40 right-40 w-32 h-32 border border-purple-500/30 rotate-12" />
        <div className="hero-decor absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-r from-primary/20 to-transparent rotate-45" />

        <div className="container relative z-10 py-20">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge with glow effect */}
            <div className="hero-badge inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/50 mb-8 backdrop-blur-sm shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Your Complete Event Solution
              </span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>

            {/* Main heading with split text animation */}
            <h1 className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
              <SplitText className="block text-foreground">Plan Perfect Events</SplitText>
              <span className="block mt-2">
                <SplitText delay={0.5} className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  with EventSphere
                </SplitText>
              </span>
            </h1>

            {/* Subtitle with fade animation */}
            <p className="hero-subtitle mb-10 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Whether you're attending a concert, organizing a wedding, or offering catering services —
              <span className="text-foreground font-semibold"> EventSphere brings everyone together </span>
              in one powerful platform.
            </p>

            {/* CTA Buttons with hover effects */}
            <div className="hero-buttons flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="group relative text-lg px-10 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-2xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-primary/50"
              >
                <span className="relative z-10 flex items-center">
                  {isAuthenticated ? (
                    <>
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-5 w-5 animate-pulse" />
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to="/events">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Events
                </Link>
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Section - ONLY SHOW IF NOT LOGGED IN */}
      {!isAuthenticated && (
        <section ref={rolesRef} className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container relative">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2" variant="outline">
                <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                Choose Your Path
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <GlitchText>Who is EventSphere For?</GlitchText>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Choose your path and unlock features designed specifically for you
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {roleOptions.map((role, index) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.id}
                    className={`role-card relative overflow-hidden bg-gradient-to-b from-card to-card/50 border-2 border-transparent hover:border-primary/50 transition-all duration-500 cursor-pointer group hover:shadow-2xl ${role.glowColor} hover:-translate-y-2`}
                    onClick={() => navigate(`/register?role=${role.id}`)}
                  >
                    {/* Top gradient line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.color}`} />

                    {/* Glow effect on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    <CardHeader className="text-center pb-4 relative">
                      <div
                        className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r ${role.color} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
                      >
                        <Icon className="h-10 w-10" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{role.title}</CardTitle>
                      <CardDescription className="text-base">{role.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <ul className="space-y-3">
                        {role.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="relative">
                      <Button
                        className={`w-full bg-gradient-to-r ${role.color} border-0 group-hover:shadow-lg transition-all duration-300`}
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section - Vengeance Style */}
      <section ref={statsRef} className="relative py-20 border-y border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
        <div className="container relative">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number={10000} label="Events Hosted" icon={Calendar} suffix="+" />
            <StatCard number={50000} label="Happy Attendees" icon={Users} suffix="+" />
            <StatCard number={500} label="Verified Vendors" icon={Building2} suffix="+" />
            <StatCard number={98} label="Satisfaction Rate" icon={Star} suffix="%" />
          </div>
        </div>
      </section>

      {/* Event Types Section - Vengeance Style */}
      <section ref={eventTypesRef} className="py-24 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        </div>
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <SplitText>Perfect for Every Occasion</SplitText>
            </h2>
            <p className="text-muted-foreground text-lg">
              From intimate gatherings to grand celebrations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <EventTypeCard
              icon={Heart}
              title="Weddings"
              description="Plan your perfect day"
              gradient="from-pink-500 to-rose-500"
            />
            <EventTypeCard
              icon={PartyPopper}
              title="Parties"
              description="Birthday, Anniversary & more"
              gradient="from-purple-500 to-violet-500"
            />
            <EventTypeCard
              icon={Music}
              title="Concerts"
              description="Live music experiences"
              gradient="from-blue-500 to-cyan-500"
            />
            <EventTypeCard
              icon={Briefcase}
              title="Corporate"
              description="Conferences & meetings"
              gradient="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section ref={featuredRef} className="relative py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Badge className="mb-4" variant="secondary">
                <Flame className="mr-1 h-3 w-3 text-orange-500" />
                Hot Events
              </Badge>
              <h2 className="mb-2 text-4xl font-black">
                <SplitText>Upcoming Events</SplitText>
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover amazing events happening near you
              </p>
            </div>
            <Button variant="outline" className="group border-2" asChild>
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {isLoading && <EventsGridSkeleton />}

          {!isLoading && featuredEvents?.length === 0 && (
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Be the first to create an event!"
            />
          )}

          {!isLoading && featuredEvents?.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, index) => (
                <div key={event.id} className="featured-card">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Organizer Features - ONLY SHOW IF NOT LOGGED IN */}
      {!isAuthenticated && (
        <section ref={organizerRef} className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
          <div className="container relative">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div>
                <Badge className="mb-6 px-4 py-2" variant="outline">
                  <Shield className="mr-2 h-4 w-4 text-purple-500" />
                  For Event Organizers
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  <SplitText>Full Control Over</SplitText>
                  <span className="block text-primary mt-2">Your Events</span>
                </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  As an organizer, you have complete control over every aspect of your event —
                  from setting ticket prices to managing vendors and guest lists.
                </p>
                <ul className="space-y-6">
                  <FeatureItem
                    title="Custom Ticket Pricing"
                    description="Set different prices for Normal, VIP, and VVIP tickets"
                    icon={Zap}
                  />
                  <FeatureItem
                    title="Guest Management"
                    description="Invite guests, track RSVPs, and manage seating"
                    icon={Users}
                  />
                  <FeatureItem
                    title="Vendor Hiring"
                    description="Browse and hire caterers, decorators, photographers & more"
                    icon={Building2}
                  />
                  <FeatureItem
                    title="Private Events"
                    description="Create invitation-only events for weddings & family functions"
                    icon={Shield}
                  />
                </ul>
                <Button className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                  <Link to="/register?role=organizer">
                    Start Organizing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="organizer-visual relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 p-1">
                  <div className="h-full w-full rounded-3xl bg-background/80 backdrop-blur-xl shadow-2xl p-8 space-y-6 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Calendar className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-xl">Wedding Reception</p>
                        <p className="text-sm text-muted-foreground">Private Event • 200 Guests</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { tier: 'Normal Guest', price: '$50', color: 'from-green-500 to-emerald-500' },
                        { tier: 'VIP Guest', price: '$150', color: 'from-blue-500 to-cyan-500' },
                        { tier: 'VVIP Guest', price: '$300', color: 'from-purple-500 to-pink-500' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                        >
                          <span className="font-medium">{item.tier}</span>
                          <span className={`font-bold text-lg bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Only You Control Pricing</span>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl rotate-12 animate-bounce">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-xl -rotate-12">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Show only if not logged in */}
      {!isAuthenticated && (
        <section ref={ctaRef} className="relative py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00di0yaDR2MnptMC02aC00di0yaDR2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

          <div className="container relative z-10">
            <div className="cta-content text-center text-white">
              <h2 className="mb-6 text-4xl md:text-6xl font-black">
                <GlitchText>Ready to Create Amazing Events?</GlitchText>
              </h2>
              <p className="mb-10 text-xl opacity-90 max-w-3xl mx-auto">
                Join thousands of organizers, attendees, and vendors who trust EventSphere
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleGetStarted}
                  className="text-lg px-10 py-6 bg-white text-primary hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Flame className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link to="/events">Explore Events</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-3xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center font-black">
              How do you want to use <span className="text-primary">EventSphere</span>?
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose your primary role to get started
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3 py-6">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => {
                    setShowRoleDialog(false);
                    navigate(`/register?role=${role.id}`);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${role.color} text-white shadow-lg`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.subtitle}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
              onClick={() => setShowRoleDialog(false)}
            >
              Log in
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Sub-components
function StatCard({ number, label, icon: Icon, suffix = '' }) {
  return (
    <div className="stat-card text-center group">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <span className="stat-number text-4xl md:text-5xl font-black" data-target={number}>
          0
        </span>
        <span className="text-2xl font-bold text-primary">{suffix}</span>
      </div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

function EventTypeCard({ icon: Icon, title, description, gradient }) {
  return (
    <Link to={`/events?category=${title.toLowerCase()}`}>
      <Card className="event-type-card group relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        <CardContent className="p-8 text-center relative">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
          >
            <Icon className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-xl mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureItem({ title, description, icon: Icon = CheckCircle }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-1 p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-colors">
        <Icon className="h-5 w-5 text-green-500" />
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <Card className="overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2">
      <div className="aspect-video overflow-hidden bg-muted relative">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        {!event.banner_url && (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
            <Calendar className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="capitalize font-semibold">
            {event.category}
          </Badge>
          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <h3 className="mb-3 line-clamp-1 text-xl font-bold group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full group/btn bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" asChild>
          <Link to={`/events/${event.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function EventsGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-1 h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default HomePage;
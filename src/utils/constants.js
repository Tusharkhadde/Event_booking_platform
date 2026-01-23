export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
};

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const EVENT_CATEGORIES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'party', label: 'Party' },
  { value: 'concert', label: 'Concert' },
  { value: 'conference', label: 'Conference' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'other', label: 'Other' },
];

export const PLANNING_TEMPLATES = {
  wedding: {
    name: 'Wedding Planning',
    sections: [
      { id: 'venue', title: 'Venue & Location', items: [] },
      { id: 'catering', title: 'Catering & Menu', items: [] },
      { id: 'decoration', title: 'Decoration & Theme', items: [] },
      { id: 'photography', title: 'Photography & Video', items: [] },
      { id: 'entertainment', title: 'Music & Entertainment', items: [] },
      { id: 'attire', title: 'Attire & Accessories', items: [] },
      { id: 'invitations', title: 'Invitations & Stationery', items: [] },
      { id: 'ceremony', title: 'Ceremony Details', items: [] },
      { id: 'reception', title: 'Reception Planning', items: [] },
    ],
  },
  party: {
    name: 'Party Planning',
    sections: [
      { id: 'venue', title: 'Venue Selection', items: [] },
      { id: 'theme', title: 'Theme & Decoration', items: [] },
      { id: 'food', title: 'Food & Drinks', items: [] },
      { id: 'entertainment', title: 'Entertainment', items: [] },
      { id: 'guests', title: 'Guest List', items: [] },
      { id: 'activities', title: 'Activities & Games', items: [] },
    ],
  },
};

export const RSVP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

export const GUEST_CATEGORIES = [
  { value: 'vip', label: 'VIP' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'colleagues', label: 'Colleagues' },
  { value: 'other', label: 'Other' },
];
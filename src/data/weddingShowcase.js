export const weddingShowcase = {
  event: {
    title: 'Aarav & Meera Wedding Reception',
    subtitle: 'Grand Royal Wedding Reception',
    category: 'wedding',
    isPrivate: true,
    date: '2024-12-15',
    time: '7:00 PM – 11:30 PM',
    location: 'Grand Royal Palace, MG Road, Bengaluru, Karnataka',
    bannerUrl: 'https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg',
    description:
      'An elegant evening reception to celebrate the wedding of Aarav & Meera, with family and close friends. Traditional decor, live music, and a curated multi-course dinner.',
  },
  organizer: {
    name: 'Aarav Sharma',
    role: 'Organizer',
    email: 'aarav.organizer@example.com',
    phone: '+91-9876543210',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  },
  venue: {
    name: 'Grand Royal Palace',
    city: 'Bengaluru',
    capacity: 300,
    priceRange: '$$$',
    address: 'MG Road, Bengaluru, Karnataka 560001',
    amenities: [
      'Valet Parking',
      'Central AC',
      'Stage & LED Wall',
      'Bridal Room',
      'In-house Catering',
      'Sound System',
      'Decor Support',
    ],
    photos: [
      'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg',
      'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
      'https://images.pexels.com/photos/169213/pexels-photo-169213.jpeg',
    ],
  },
  ticketTiers: [
    {
      name: 'Normal Guest',
      description: 'Family & friends – regular seating, full dinner buffet',
      price: 0,
      quantity: 150,
      color: 'blue',
    },
    {
      name: 'VIP Guest',
      description: 'Close family – front seating, table service, special welcome drink',
      price: 0,
      quantity: 60,
      color: 'purple',
    },
    {
      name: 'VVIP Guest',
      description: 'Immediate family – stage area seating, dedicated host, exclusive menu items',
      price: 0,
      quantity: 40,
      color: 'amber',
    },
  ],
  menus: [
    {
      name: 'Veg Dinner Buffet',
      type: 'veg',
      description: 'Traditional North Indian vegetarian wedding dinner.',
      items: [
        'Paneer Butter Masala',
        'Dal Makhani',
        'Jeera Rice',
        'Assorted Indian Breads',
        'Gulab Jamun',
      ],
    },
    {
      name: 'Non-Veg Starters',
      type: 'non-veg',
      description: 'Non-vegetarian starters passed around during reception.',
      items: ['Murgh Malai Tikka', 'Fish Amritsari', 'Chicken Lollipop'],
    },
  ],
  guests: {
    totalInvited: 250,
    confirmed: 180,
    pending: 40,
    declined: 30,
    sampleList: [
      { name: 'Rohan Verma', category: 'Friend', rsvp: 'Accepted' },
      { name: 'Priya Mehta', category: 'Family', rsvp: 'Pending' },
      { name: 'Mr. & Mrs. Kapoor', category: 'VIP', rsvp: 'Accepted' },
    ],
  },
  planning: {
    tasks: [
      {
        title: 'Finalize guest list',
        status: 'In Progress',
        dueDate: '2024-12-01',
      },
      {
        title: 'Meet decorator at venue',
        status: 'Pending',
        dueDate: '2024-12-05',
      },
      {
        title: 'Confirm photographer & videographer',
        status: 'Completed',
        dueDate: '2024-12-03',
      },
    ],
    notes:
      'Theme: Traditional pastel with gold accents. Entry song selected. Family photo session before guests arrive.',
  },
};
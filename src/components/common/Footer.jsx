import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EventSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your complete event management and personal event planning platform.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Events</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/events" className="hover:text-foreground">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=wedding" className="hover:text-foreground">
                  Weddings
                </Link>
              </li>
              <li>
                <Link to="/events?category=party" className="hover:text-foreground">
                  Parties
                </Link>
              </li>
              <li>
                <Link to="/events?category=conference" className="hover:text-foreground">
                  Conferences
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Planning</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/organizer/events/create" className="hover:text-foreground">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="hover:text-foreground">
                  Find Vendors
                </Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-foreground">
                  Browse Venues
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EventSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
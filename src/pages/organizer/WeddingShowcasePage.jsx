// src/pages/organizer/WeddingShowcasePage.jsx
import { weddingShowcase } from '@/data/weddingShowcase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function WeddingShowcasePage() {
  // This will prove whether the data is loading at all
  console.log('weddingShowcase data:', weddingShowcase);

  const { event, organizer } = weddingShowcase;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wedding Showcase Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Event title:</strong> {event.title}</p>
          <p><strong>Organizer:</strong> {organizer.name}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeddingShowcasePage;
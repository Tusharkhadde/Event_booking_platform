import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Phone, Mail, Star, CheckCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVenue, useAddVenueReview } from '@/hooks/useVenues';
import useAuthStore from '@/store/authStore';
import { formatDate, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function VenueDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { data: venue, isLoading } = useVenue(id);
  const addReviewMutation = useAddVenueReview();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  if (isLoading) return <div className="container py-8">Loading...</div>;
  if (!venue) return <EmptyState title="Venue not found" />;

  const handleAddReview = () => {
    addReviewMutation.mutate({
      venue_id: id,
      user_id: user.id,
      rating: parseInt(reviewRating),
      comment: reviewComment
    }, {
      onSuccess: () => {
        setReviewComment('');
      }
    });
  };

  const averageRating = venue.reviews?.length 
    ? (venue.reviews.reduce((acc, r) => acc + r.rating, 0) / venue.reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Venues
      </Button>

      {/* Gallery Section */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="md:col-span-2 aspect-video bg-muted rounded-lg overflow-hidden relative">
          {venue.images && venue.images[selectedImage] ? (
            <img 
              src={venue.images[selectedImage]} 
              alt="Venue Main" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px]">
          {venue.images?.map((img, idx) => (
            <div 
              key={idx} 
              className={`aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setSelectedImage(idx)}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{venue.name}</h1>
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                <span className="font-bold text-yellow-700 dark:text-yellow-300">{averageRating}</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
              <MapPin className="h-5 w-5" /> {venue.address}, {venue.city}
            </p>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">About this Venue</h3>
            <p className="text-muted-foreground whitespace-pre-line">{venue.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {venue.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Reviews ({venue.reviews?.length || 0})</h3>
            
            {/* Add Review Box */}
            {isAuthenticated ? (
              <Card className="mb-8">
                <CardHeader><CardTitle className="text-base">Leave a Review</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={reviewRating} onValueChange={setReviewRating}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                      <SelectItem value="2">⭐⭐ 2</SelectItem>
                      <SelectItem value="1">⭐ 1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea 
                    placeholder="Share your experience..." 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <Button onClick={handleAddReview} disabled={addReviewMutation.isPending}>
                    {addReviewMutation.isPending ? 'Posting...' : 'Post Review'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-muted p-4 rounded-lg text-center mb-8">
                Please <Button variant="link" className="px-1" onClick={() => navigate('/login')}>login</Button> to leave a review.
              </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
              {venue.reviews?.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(review.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{review.user?.name || 'Anonymous'}</h4>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              ))}
              {venue.reviews?.length === 0 && <p className="text-muted-foreground italic">No reviews yet.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Venue Facts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Capacity
                </span>
                <span className="font-medium">{venue.capacity} Guests</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price Range</span>
                <Badge variant="secondary">{venue.price_range}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Contact</h4>
                {venue.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> {venue.contact_phone}
                  </div>
                )}
                {venue.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {venue.contact_email}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Button className="w-full" size="lg" onClick={() => navigate('/organizer/events/create?venue=' + venue.id)}>
            Book for Event
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VenueDetailsPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  MapPin,
  Users,
  Phone,
  Mail,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { venueSchema } from '@/validations/venueSchema';
import { useCreateVenue } from '@/hooks/useVenues';
import venueService from '@/services/venueService';
import { toast } from '@/hooks/useToast';

function CreateVenuePage() {
  const navigate = useNavigate();
  const createVenueMutation = useCreateVenue();
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      capacity: '',
      price_range: '$$',
      amenities: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  const selectedPriceRange = watch('price_range');

  // Handle image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);

    try {
      setIsUploading(true);
      let imageUrls = [];

      // Upload images if any
      if (images.length > 0) {
        setUploadProgress(`Uploading ${images.length} images...`);
        
        try {
          imageUrls = await venueService.uploadVenueImages(images);
          console.log('Uploaded image URLs:', imageUrls);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast({
            title: 'Image Upload Failed',
            description: uploadError.message || 'Failed to upload images. Please try again.',
            variant: 'destructive',
          });
          setIsUploading(false);
          setUploadProgress('');
          return;
        }
      }

      setUploadProgress('Creating venue...');

      // Parse amenities from comma-separated string to array
      const amenitiesArray = data.amenities
        ? data.amenities
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [];

      // Prepare venue data
      const venueData = {
        name: data.name,
        description: data.description || null,
        address: data.address,
        city: data.city,
        state: data.state || null,
        capacity: parseInt(data.capacity, 10),
        price_range: data.price_range,
        amenities: amenitiesArray,
        images: imageUrls,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
      };

      console.log('Creating venue with data:', venueData);

      // Create venue
      createVenueMutation.mutate(venueData, {
        onSuccess: (createdVenue) => {
          console.log('Venue created successfully:', createdVenue);
          setIsUploading(false);
          setUploadProgress('');
          navigate('/venues');
        },
        onError: (error) => {
          console.error('Create venue error:', error);
          setIsUploading(false);
          setUploadProgress('');
          toast({
            title: 'Failed to Create Venue',
            description: error.message || 'Something went wrong. Please try again.',
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      console.error('Submission error:', error);
      setIsUploading(false);
      setUploadProgress('');
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isUploading || createVenueMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Venue</h1>
          <p className="text-muted-foreground">
            List a venue for weddings, parties, and events
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the main details about the venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Venue Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Venue Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Grand Ballroom, Rose Garden Hall"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the venue, its atmosphere, special features..."
                    rows={4}
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Capacity & Price Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">
                      Capacity (Guests) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="e.g., 200"
                        className="pl-10"
                        {...register('capacity')}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.capacity && (
                      <p className="text-sm text-destructive">{errors.capacity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_range">Price Range</Label>
                    <Select
                      value={selectedPriceRange}
                      onValueChange={(value) => setValue('price_range', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget Friendly</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Premium</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.price_range && (
                      <p className="text-sm text-destructive">{errors.price_range.message}</p>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Input
                    id="amenities"
                    placeholder="e.g., Parking, WiFi, AC, Catering, DJ Setup, Decoration"
                    {...register('amenities')}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple amenities with commas
                  </p>
                  {errors.amenities && (
                    <p className="text-sm text-destructive">{errors.amenities.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where is the venue located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      className="pl-10"
                      {...register('address')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      {...register('city')}
                      disabled={isLoading}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      {...register('state')}
                      disabled={isLoading}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How can people reach out about this venue?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contact_phone"
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                        {...register('contact_phone')}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.contact_phone && (
                      <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="venue@example.com"
                        className="pl-10"
                        {...register('contact_email')}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.contact_email && (
                      <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload photos of the venue (recommended: at least 3 photos)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Button */}
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="images"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    <div className="rounded-full bg-primary/10 p-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB each
                    </span>
                  </label>
                </div>

                {/* Image Count */}
                <p className="text-center text-sm text-muted-foreground">
                  {images.length} photo{images.length !== 1 ? 's' : ''} selected
                </p>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isLoading}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg bg-muted p-8">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No photos uploaded yet
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="space-y-4">
              {uploadProgress && (
                <div className="rounded-lg bg-muted p-3 text-center text-sm">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                  {uploadProgress}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Venue...' : 'Create Venue'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="mb-2 font-medium">Tips for a great listing</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Add at least 5-10 high-quality photos</li>
                  <li>• Include interior and exterior shots</li>
                  <li>• Write a detailed description</li>
                  <li>• List all available amenities</li>
                  <li>• Keep contact info up to date</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateVenuePage;
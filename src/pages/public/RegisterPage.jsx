import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Loader2,
  UserCheck,
  Building2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { registerSchema } from '@/validations/authSchema';
import useAuth from '@/hooks/useAuth';
import useAuthStore from '@/store/authStore';
import { cn } from '@/utils/cn';

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, isSigningUp } = useAuth();
  const { isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Role selection, 2: Details
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');

  // If role is pre-selected from URL, go to step 2
  useEffect(() => {
    if (searchParams.get('role')) {
      setSelectedRole(searchParams.get('role'));
      setStep(2);
    }
  }, [searchParams]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: selectedRole || 'customer',
    },
  });

  const roleOptions = [
    {
      id: 'customer',
      title: 'Attendee',
      subtitle: 'I want to discover and attend events',
      icon: UserCheck,
      color: 'bg-blue-500',
      description: 'Perfect for people who want to explore events, book tickets, and attend amazing experiences.',
      features: ['Browse all events', 'Book tickets', 'RSVP to invitations', 'Save favorites'],
    },
    {
      id: 'organizer',
      title: 'Organizer',
      subtitle: 'I want to create and manage events',
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'Ideal for event planners who want full control over their events, pricing, and vendors.',
      features: ['Create events', 'Set ticket prices', 'Manage guests', 'Hire vendors'],
    },
    {
      id: 'vendor',
      title: 'Vendor',
      subtitle: 'I offer event services',
      icon: Building2,
      color: 'bg-green-500',
      description: 'For caterers, decorators, photographers, DJs, and other service providers.',
      features: ['List services', 'Receive bookings', 'Manage availability', 'Get paid'],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const onSubmit = (data) => {
    signUp({
      ...data,
      role: selectedRole,
    });
  };

  const selectedRoleData = roleOptions.find((r) => r.id === selectedRole);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="w-full max-w-4xl">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Join EventSphere</h1>
              <p className="text-muted-foreground">
                Choose how you want to use EventSphere
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg',
                      selectedRole === role.id && 'ring-2 ring-primary'
                    )}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${role.color} text-white`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <CardTitle>{role.title}</CardTitle>
                      <CardDescription>{role.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {role.description}
                      </p>
                      <ul className="space-y-2">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">
                        Select
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Account Details */}
        {step === 2 && (
          <div className="flex gap-8">
            {/* Selected Role Info */}
            <Card className="hidden md:block w-80 flex-shrink-0 h-fit">
              <CardContent className="p-6">
                {selectedRoleData && (
                  <>
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${selectedRoleData.color} text-white`}
                    >
                      <selectedRoleData.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">
                      {selectedRoleData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {selectedRoleData.description}
                    </p>
                    <ul className="space-y-2">
                      {selectedRoleData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Role
                </Button>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center gap-2 md:hidden mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {selectedRoleData && (
                    <Badge className={selectedRoleData.color}>
                      {selectedRoleData.title}
                    </Badge>
                  )}
                </div>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...register('name')}
                      disabled={isSigningUp}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('email')}
                      disabled={isSigningUp}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      {...register('password')}
                      disabled={isSigningUp}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      disabled={isSigningUp}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Role-specific info */}
                  {selectedRole === 'organizer' && (
                    <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-4">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        <strong>As an Organizer:</strong> You'll have full control over event creation, 
                        ticket pricing (Normal/VIP/VVIP), guest management, and vendor hiring.
                      </p>
                    </div>
                  )}

                  {selectedRole === 'vendor' && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>As a Vendor:</strong> After registration, you'll be able to list your 
                        services and start receiving booking requests from event organizers.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSigningUp}
                  >
                    {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSigningUp ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Log in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
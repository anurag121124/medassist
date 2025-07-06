'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Globe, 
  Star,
  Clock,
  Navigation,
  Calendar,
  Users,
  Heart,
  Stethoscope,
  Eye,
  Brain,
  Bone,
  Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  reviews_count: number;
  accepted_insurance: string[];
  distance?: number;
  availability?: {
    [key: string]: Array<{
      start_time: string;
      end_time: string;
      available: boolean;
    }>;
  };
}

const specialties = [
  { value: 'all', label: 'All Specialties', icon: Stethoscope },
  { value: 'general', label: 'General Medicine', icon: Stethoscope },
  { value: 'cardiology', label: 'Cardiology', icon: Heart },
  { value: 'dermatology', label: 'Dermatology', icon: Eye },
  { value: 'neurology', label: 'Neurology', icon: Brain },
  { value: 'orthopedics', label: 'Orthopedics', icon: Bone },
  { value: 'pediatrics', label: 'Pediatrics', icon: Baby },
];

const insuranceProviders = [
  'Aetna', 'Blue Cross', 'Cigna', 'United Healthcare', 'Medicaid', 'Medicare'
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [radius, setRadius] = useState(25);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Auto-search with current location
          searchProviders(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to NYC coordinates
          const defaultLat = 40.7128;
          const defaultLng = -74.0060;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          searchProviders(defaultLat, defaultLng);
        }
      );
    }
  }, []);

  const searchProviders = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const searchLat = lat || userLocation?.lat || 40.7128;
      const searchLng = lng || userLocation?.lng || -74.0060;
      
      const params = new URLSearchParams({
        lat: searchLat.toString(),
        lng: searchLng.toString(),
        radius: radius.toString(),
        ...(selectedSpecialty !== 'all' && { specialty: selectedSpecialty }),
        ...(selectedInsurance && { insurance: selectedInsurance }),
      });

      const response = await fetch(`/api/providers/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search providers');
      }

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      toast.error('Failed to search providers. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) {
      toast.error('Please enter a location');
      return;
    }

    // In a real app, you'd use Google Geocoding API here
    // For now, we'll use the current location
    if (userLocation) {
      searchProviders(userLocation.lat, userLocation.lng);
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyData = specialties.find(s => s.value === specialty.toLowerCase());
    const IconComponent = specialtyData?.icon || Stethoscope;
    return <IconComponent className="h-5 w-5" />;
  };

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)} mi`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Find Healthcare Providers</h1>
                  <p className="text-gray-600">Locate nearby doctors, specialists, and medical facilities</p>
                </div>
              </div>

              {/* Search Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter city, zip code, or address"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                        />
                        <Button onClick={handleLocationSearch} disabled={loading}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Insurance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Insurance</SelectItem>
                        {insuranceProviders.map(insurance => (
                          <SelectItem key={insurance} value={insurance}>
                            {insurance}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={radius.toString()} onValueChange={(value) => setRadius(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      {providers.length} providers found
                      {userLocation && ` within ${radius} miles`}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => searchProviders()}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Provider List */}
              <div className="lg:col-span-2 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : providers.length > 0 ? (
                  providers.map((provider) => (
                    <Card key={provider.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-100 rounded-full">
                                {getSpecialtyIcon(provider.specialty)}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                                <p className="text-sm text-gray-600">{provider.specialty}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{provider.address}</span>
                                {provider.distance && (
                                  <Badge variant="outline" className="ml-2">
                                    {formatDistance(provider.distance)}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{provider.phone}</span>
                              </div>

                              {provider.website && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Globe className="h-4 w-4" />
                                  <a href={provider.website} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-600 hover:underline">
                                    Visit Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(provider.rating)}
                              <span className="text-sm text-gray-600 ml-1">
                                ({provider.reviews_count})
                              </span>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedProvider(provider)}>
                                  View Details
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {provider.accepted_insurance.slice(0, 3).map((insurance) => (
                            <Badge key={insurance} variant="secondary" className="text-xs">
                              {insurance}
                            </Badge>
                          ))}
                          {provider.accepted_insurance.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.accepted_insurance.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Book Appointment
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Navigation className="h-4 w-4" />
                            Get Directions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Providers Found</h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search criteria or expanding the search radius.
                      </p>
                      <Button onClick={() => searchProviders()}>
                        Search Again
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Map Placeholder & Quick Actions */}
              <div className="space-y-6">
                {/* Map */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Map View
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Interactive map would appear here</p>
                        <p className="text-sm text-gray-500">Google Maps integration required</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Emergency Services
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Find Specialists
                    </Button>
                  </CardContent>
                </Card>

                {/* Popular Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {specialties.slice(1, 6).map((specialty) => {
                        const IconComponent = specialty.icon;
                        return (
                          <button
                            key={specialty.value}
                            onClick={() => {
                              setSelectedSpecialty(specialty.value);
                              searchProviders();
                            }}
                            className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <IconComponent className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{specialty.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Provider Details Modal */}
            {selectedProvider && (
              <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {getSpecialtyIcon(selectedProvider.specialty)}
                      </div>
                      {selectedProvider.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{selectedProvider.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{selectedProvider.phone}</span>
                          </div>
                          {selectedProvider.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Accepted Insurance</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProvider.accepted_insurance.map((insurance) => (
                            <Badge key={insurance} variant="secondary">
                              {insurance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Navigation className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
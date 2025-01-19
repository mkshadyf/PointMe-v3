import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Business, UpdateBusinessInput } from '@/types/business';
import { businessService } from '@/services/businessService';
import { uploadFile } from '@/lib/storage';

interface BusinessProfileForm extends UpdateBusinessInput {
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export default function BusinessProfile() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<BusinessProfileForm>({
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      subcategories: [],
      website: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
      },
    },
  });

  useEffect(() => {
    loadBusinessProfile();
  }, [user]);

  const loadBusinessProfile = async () => {
    try {
      if (!user) return;
      const businessData = await businessService.getBusinessByUserId(user.id);
      if (businessData) {
        setBusiness(businessData);
        reset(businessData);
      }
    } catch (err) {
      setError('Failed to load business profile');
      console.error(err);
    }
  };

  const onSubmit = async (data: BusinessProfileForm) => {
    try {
      setIsLoading(true);
      if (!business) return;
      
      const updateData: UpdateBusinessInput = {
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        category: data.category,
        subcategories: data.subcategories,
        website: data.website,
        socialMedia: data.socialMedia,
      };

      await businessService.updateBusiness(business.id, updateData);
      setIsEditing(false);
      await loadBusinessProfile();
      setError(null);
    } catch (err) {
      setError('Failed to update business profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file || !business) return;

      // Upload to storage
      const url = await uploadFile(`business/${business.id}/${type}`, file);

      // Update business profile with new image URL
      await businessService.updateBusiness(business.id, {
        [type === 'logo' ? 'logoUrl' : 'coverImageUrl']: url,
      });

      await loadBusinessProfile();
      setError(null);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!business) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info">No business profile found. Please create one.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, position: 'relative' }}>
        {/* Cover Image */}
        <Box
          sx={{
            height: 200,
            width: '100%',
            backgroundColor: 'grey.200',
            backgroundImage: business.coverImageUrl
              ? `url(${business.coverImageUrl})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {isEditing && (
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="cover-image-upload"
              type="file"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          )}
        </Box>

        {/* Profile Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Logo and Basic Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={business.logoUrl}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {isEditing && (
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                />
              )}
              <Typography variant="h5" gutterBottom>
                {business.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {business.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {business.category && (
                  <Chip label={business.category} sx={{ mr: 1 }} />
                )}
                {business.subcategories?.map((sub) => (
                  <Chip key={sub} label={sub} variant="outlined" sx={{ mr: 1 }} />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="action" />
                <Typography>{business.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon color="action" />
                <Typography>{business.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="action" />
                <Typography>{business.email}</Typography>
              </Box>
              {business.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WebsiteIcon color="action" />
                  <Typography>{business.website}</Typography>
                </Box>
              )}
            </Box>

            {/* Social Media Links */}
            {business.socialMedia && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Social Media
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {business.socialMedia.facebook && (
                    <IconButton
                      href={business.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookIcon />
                    </IconButton>
                  )}
                  {business.socialMedia.twitter && (
                    <IconButton
                      href={business.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TwitterIcon />
                    </IconButton>
                  )}
                  {business.socialMedia.instagram && (
                    <IconButton
                      href={business.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Edit Button */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

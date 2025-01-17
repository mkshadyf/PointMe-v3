import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { NotificationPreferences as NotificationPreferencesType } from '../../types/notification';

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = React.useState<NotificationPreferencesType>({
    channels: {
      email: true,
      sms: false,
      push: true,
      in_app: true,
    },
    types: {
      appointments: true,
      reviews: true,
      marketing: false,
      system: true,
    },
    schedule: {
      start: '09:00',
      end: '21:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      quietHours: true,
    },
  });

  const handleChannelChange = (channel: keyof NotificationPreferencesType['channels']) => {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleTypeChange = (type: keyof NotificationPreferencesType['types']) => {
    setPreferences((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  const handleScheduleChange = (
    field: keyof NotificationPreferencesType['schedule'],
    value: string | boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader title="Notification Preferences" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Channels
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.channels.email}
                      onChange={() => handleChannelChange('email')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.channels.sms}
                      onChange={() => handleChannelChange('sms')}
                      color="primary"
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.channels.push}
                      onChange={() => handleChannelChange('push')}
                      color="primary"
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.channels.in_app}
                      onChange={() => handleChannelChange('in_app')}
                      color="primary"
                    />
                  }
                  label="In-App Notifications"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.types.appointments}
                      onChange={() => handleTypeChange('appointments')}
                      color="primary"
                    />
                  }
                  label="Appointment Updates"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.types.reviews}
                      onChange={() => handleTypeChange('reviews')}
                      color="primary"
                    />
                  }
                  label="Review Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.types.marketing}
                      onChange={() => handleTypeChange('marketing')}
                      color="primary"
                    />
                  }
                  label="Marketing Updates"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.types.system}
                      onChange={() => handleTypeChange('system')}
                      color="primary"
                    />
                  }
                  label="System Notifications"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={preferences.schedule.start}
                    onChange={(e) => handleScheduleChange('start', e.target.value)}
                    label="Start Time"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <MenuItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>End Time</InputLabel>
                  <Select
                    value={preferences.schedule.end}
                    onChange={(e) => handleScheduleChange('end', e.target.value)}
                    label="End Time"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <MenuItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.schedule.quietHours}
                      onChange={(e) => handleScheduleChange('quietHours', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable Quiet Hours"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;

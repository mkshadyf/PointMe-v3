export interface AdminStats {
  // User statistics
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;

  // Business statistics
  totalBusinesses: number;
  activeBusinesses: number;
  businessGrowth: number;
  pendingBusinesses: number;

  // Appointment statistics
  totalAppointments: number;
  appointmentsToday: number;
  appointmentGrowth: number;
  completedAppointments: number;
  cancelledAppointments: number;

  // Report statistics
  totalReports: number;
  reportGrowth: number;
  resolvedReports: number;
  pendingReports: number;

  // Growth data over time
  growthData: {
    users: { date: string; count: number }[];
    businesses: { date: string; count: number }[];
    appointments: { date: string; count: number }[];
  };

  // Category distribution
  categoryDistribution: {
    businessCategories: { name: string; count: number }[];
    serviceCategories: { name: string; count: number }[];
  };

  // Appointment statistics by status
  appointmentStats: {
    status: string;
    count: number;
  }[];
}

export interface Report {
  id: string;
  type: 'user' | 'business' | 'content';
  description: string;
  content: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reporterId: string;
  targetId: string;
}

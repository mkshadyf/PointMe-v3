import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{user?.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Role</h3>
              <p className="capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

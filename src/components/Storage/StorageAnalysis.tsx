import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const StorageAnalysis: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage analysis</CardTitle>
        <CardDescription>
          Bucket analysis required Supabase Storage. With PostgreSQL only, configure an
          object store and ingest usage metrics separately if needed.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
};

export default StorageAnalysis;

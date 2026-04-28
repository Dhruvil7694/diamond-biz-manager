import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Former Supabase Storage browser. Local PostgreSQL + REST API deployments do not
 * include hosted object storage — add S3, MinIO, or similar if uploads are needed.
 */
const SupabaseStorageManage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Object storage</CardTitle>
        <CardDescription>
          Supabase Storage is not wired up in the PostgreSQL + local API setup. Attach a
          bucket service (AWS S3, MinIO, etc.) here if your workflow needs file uploads.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
};

export default SupabaseStorageManage;

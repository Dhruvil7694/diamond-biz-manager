import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartPie, FileSearch, AlertTriangle, BarChart2, FileX } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  largeFiles: Array<{name: string, size: number, path: string, bucket: string}>;
  unusedFiles: Array<{name: string, size: number, path: string, bucket: string, lastAccessed: string}>;
  duplicateFiles: Array<{
    hash: string, 
    files: Array<{name: string, size: number, path: string, bucket: string}>
  }>;
  fileTypeDistribution: Record<string, {count: number, size: number}>;
}

const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length === 1) return 'unknown';
  return parts[parts.length - 1].toLowerCase();
};

const StorageAnalysis: React.FC = () => {
  const { getSupabaseToken } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<'large' | 'unused' | 'duplicate' | 'distribution'>('large');

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format date relative to now (e.g., "3 months ago")
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
    if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Get Supabase token
      const token = await getSupabaseToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      // Set the auth token for the Supabase client
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      });

      // Get all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }

      const largeFiles: AnalysisResult['largeFiles'] = [];
      const unusedFiles: AnalysisResult['unusedFiles'] = [];
      const fileHashes: Record<string, {
        hash: string,
        files: {name: string, size: number, path: string, bucket: string}[]
      }> = {};
      const fileTypeDistribution: Record<string, {count: number, size: number}> = {};

      // Process each bucket
      for (const bucket of buckets) {
        // Get all files in the bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();
        
        if (filesError) {
          console.error(`Error fetching files from bucket ${bucket.name}:`, filesError);
          continue;
        }

        // Process each file
        for (const file of files) {
          if (!file.id) continue; // Skip folders
          
          // Get file metadata
          const { data: metadata } = await supabase.storage
            .from(bucket.name)
            .getPublicUrl(file.name);
          
          if (!metadata) {
            console.error(`Error getting metadata for ${file.name}`);
            continue;
          }

          const fileSize = file.metadata?.size || 0;
          const lastAccessed = file.metadata?.lastAccessedAt || file.created_at || new Date().toISOString();
          const fileExtension = getFileExtension(file.name);
          
          // Update file type distribution
          if (!fileTypeDistribution[fileExtension]) {
            fileTypeDistribution[fileExtension] = { count: 0, size: 0 };
          }
          fileTypeDistribution[fileExtension].count++;
          fileTypeDistribution[fileExtension].size += fileSize;

          // Check for large files (> 10MB)
          if (fileSize > 10 * 1024 * 1024) {
            largeFiles.push({
              name: file.name,
              size: fileSize,
              path: file.name,
              bucket: bucket.name
            });
          }

          // Check for unused files (not accessed in the last 3 months)
          const lastAccessedDate = new Date(lastAccessed);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          if (lastAccessedDate < threeMonthsAgo) {
            unusedFiles.push({
              name: file.name,
              size: fileSize,
              path: file.name,
              bucket: bucket.name,
              lastAccessed
            });
          }

          // Create a simple hash for potential duplicate detection
          // In a real implementation, you would use content hashing
          const simpleHash = `${fileSize}-${fileExtension}-${file.name.length}`;
          
          if (!fileHashes[simpleHash]) {
            fileHashes[simpleHash] = {
              hash: simpleHash,
              files: []
            };
          }
          
          fileHashes[simpleHash].files.push({
            name: file.name,
            size: fileSize,
            path: file.name,
            bucket: bucket.name
          });
        }
      }

      // Filter for duplicate files (more than one file with the same hash)
      const duplicateFiles = Object.values(fileHashes)
        .filter(group => group.files.length > 1);

      // Set analysis results
      setAnalysisResult({
        largeFiles: largeFiles.sort((a, b) => b.size - a.size), // Largest first
        unusedFiles: unusedFiles.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()), // Oldest first
        duplicateFiles,
        fileTypeDistribution
      });

      toast.success('Storage analysis completed');
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
      console.error('Storage analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderLargeFiles = () => {
    if (!analysisResult || analysisResult.largeFiles.length === 0) {
      return (
        <div className="py-6 text-center text-muted-foreground">
          No large files found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These files are larger than 10MB and may be good candidates for removal or compression.
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {analysisResult.largeFiles.map((file, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 bg-muted rounded-md"
            >
              <div className="flex-1 truncate">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">Bucket: {file.bucket}</div>
              </div>
              <div className="text-sm font-semibold">{formatBytes(file.size)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUnusedFiles = () => {
    if (!analysisResult || analysisResult.unusedFiles.length === 0) {
      return (
        <div className="py-6 text-center text-muted-foreground">
          No unused files found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These files haven't been accessed in over 3 months.
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {analysisResult.unusedFiles.map((file, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 bg-muted rounded-md"
            >
              <div className="flex-1 truncate">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">Last accessed: {formatRelativeDate(file.lastAccessed)}</div>
              </div>
              <div className="text-sm font-semibold">{formatBytes(file.size)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDuplicateFiles = () => {
    if (!analysisResult || analysisResult.duplicateFiles.length === 0) {
      return (
        <div className="py-6 text-center text-muted-foreground">
          No potential duplicate files found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These files may be duplicates based on size and extension.
        </p>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {analysisResult.duplicateFiles.slice(0, 10).map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-md p-3">
              <div className="font-medium mb-2">Potential duplicates ({group.files.length} files)</div>
              <div className="space-y-2">
                {group.files.map((file, fileIndex) => (
                  <div 
                    key={fileIndex}
                    className="flex justify-between items-center p-2 bg-muted rounded-md"
                  >
                    <div className="truncate">{file.name}</div>
                    <div className="text-sm text-muted-foreground">{formatBytes(file.size)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDistribution = () => {
    if (!analysisResult || Object.keys(analysisResult.fileTypeDistribution).length === 0) {
      return (
        <div className="py-6 text-center text-muted-foreground">
          No file type data available
        </div>
      );
    }

    // Get total storage size
    const totalSize = Object.values(analysisResult.fileTypeDistribution)
      .reduce((sum, type) => sum + type.size, 0);

    // Sort file types by size (descending)
    const sortedFileTypes = Object.entries(analysisResult.fileTypeDistribution)
      .sort(([, a], [, b]) => b.size - a.size);

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Storage usage by file type
        </p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedFileTypes.map(([extension, data]) => {
            const percentage = (data.size / totalSize) * 100;
            return (
              <div key={extension} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    .{extension}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.count} files · {formatBytes(data.size)} ({percentage.toFixed(1)}%)
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5" />
          Storage Analysis
        </CardTitle>
        <CardDescription>
          Analyze your storage to identify optimization opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!analysisResult ? (
          <div className="py-8 flex flex-col items-center gap-4">
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-diamond-600 rounded-full" />
                <p className="text-muted-foreground">Analyzing storage, please wait...</p>
              </>
            ) : (
              <>
                <Button onClick={runAnalysis} disabled={isAnalyzing}>
                  <ChartPie className="h-4 w-4 mr-2" />
                  Run Storage Analysis
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will scan your storage buckets to identify large files, unused files, and potential duplicates.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex border-b">
              <button
                className={`py-2 px-4 border-b-2 ${selectedTab === 'large' ? 'border-primary text-primary' : 'border-transparent'}`}
                onClick={() => setSelectedTab('large')}
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Large Files</span>
                  <span className="ml-1 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {analysisResult.largeFiles.length}
                  </span>
                </div>
              </button>
              <button
                className={`py-2 px-4 border-b-2 ${selectedTab === 'unused' ? 'border-primary text-primary' : 'border-transparent'}`}
                onClick={() => setSelectedTab('unused')}
              >
                <div className="flex items-center gap-1">
                  <FileX className="h-4 w-4" />
                  <span>Unused</span>
                  <span className="ml-1 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {analysisResult.unusedFiles.length}
                  </span>
                </div>
              </button>
              <button
                className={`py-2 px-4 border-b-2 ${selectedTab === 'duplicate' ? 'border-primary text-primary' : 'border-transparent'}`}
                onClick={() => setSelectedTab('duplicate')}
              >
                <div className="flex items-center gap-1">
                  <span>Duplicates</span>
                  <span className="ml-1 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {analysisResult.duplicateFiles.length}
                  </span>
                </div>
              </button>
              <button
                className={`py-2 px-4 border-b-2 ${selectedTab === 'distribution' ? 'border-primary text-primary' : 'border-transparent'}`}
                onClick={() => setSelectedTab('distribution')}
              >
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Distribution</span>
                </div>
              </button>
            </div>
            
            <div className="pt-2">
              {selectedTab === 'large' && renderLargeFiles()}
              {selectedTab === 'unused' && renderUnusedFiles()}
              {selectedTab === 'duplicate' && renderDuplicateFiles()}
              {selectedTab === 'distribution' && renderDistribution()}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={runAnalysis}
          disabled={isAnalyzing}
        >
          <ChartPie className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
        
        {analysisResult && (
          <div className="text-sm text-muted-foreground">
            Last analyzed: {new Date().toLocaleTimeString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default StorageAnalysis;
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CloudDownload, CloudUpload, Database, FileSpreadsheet, History, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const DataSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Data selection checkboxes
  const [dataSelection, setDataSelection] = useState({
    diamonds: true,
    clients: true,
    invoices: true,
    analytics: true,
    settings: false,
  });

  // Mock storage usage data
  const storageUsage = {
    used: 2.1, // GB
    total: 5, // GB
    percentage: 42, // %
    breakdown: [
      { type: 'Diamonds', size: 1.2, percentage: 57 },
      { type: 'Clients', size: 0.3, percentage: 14 },
      { type: 'Invoices', size: 0.4, percentage: 19 },
      { type: 'Other', size: 0.2, percentage: 10 },
    ]
  };
  
  const handleDataSelectionChange = (key: keyof typeof dataSelection) => {
    setDataSelection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const exportData = async () => {
    // Make sure at least one data type is selected
    if (!Object.values(dataSelection).some(Boolean)) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data type to export.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get selected data types
      const selectedTypes = Object.entries(dataSelection)
        .filter(([_, selected]) => selected)
        .map(([type]) => type);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would download a file
      // For simulation, we'll show a success message
      toast({
        title: "Export Complete",
        description: `Your ${selectedTypes.join(', ')} data has been exported in ${exportFormat.toUpperCase()} format.`,
        variant: "default",
      });
      
      // Simulate a download by creating and clicking a temporary link
      // (In a real app, this would be a real file from the server)
      const blob = new Blob([`DBMS Export - ${new Date().toISOString()}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dbms-export-${new Date().getTime()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const importData = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import Complete",
        description: `Your file "${selectedFile.name}" has been successfully imported.`,
        variant: "default",
      });
      
      setSelectedFile(null);
      setShowRestoreDialog(false);
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was a problem importing your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createBackup = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup Created",
        description: "A complete backup of your data has been created.",
        variant: "default",
      });
      
      setShowBackupDialog(false);
      
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "There was a problem creating your backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download your data in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exportFormat">File Format</Label>
            <Select 
              value={exportFormat} 
              onValueChange={setExportFormat}
            >
              <SelectTrigger id="exportFormat">
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {exportFormat === 'json' && 'JSON format is best for full database backup and restoration.'}
              {exportFormat === 'csv' && 'CSV format is ideal for importing into spreadsheet applications.'}
              {exportFormat === 'xlsx' && 'Excel format includes formatted tables and multiple sheets.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Data to Export</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exportDiamonds" 
                  checked={dataSelection.diamonds}
                  onCheckedChange={() => handleDataSelectionChange('diamonds')}
                />
                <Label htmlFor="exportDiamonds" className="text-sm">Diamonds</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exportClients" 
                  checked={dataSelection.clients}
                  onCheckedChange={() => handleDataSelectionChange('clients')}
                />
                <Label htmlFor="exportClients" className="text-sm">Clients</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exportInvoices" 
                  checked={dataSelection.invoices}
                  onCheckedChange={() => handleDataSelectionChange('invoices')}
                />
                <Label htmlFor="exportInvoices" className="text-sm">Invoices</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exportAnalytics" 
                  checked={dataSelection.analytics}
                  onCheckedChange={() => handleDataSelectionChange('analytics')}
                />
                <Label htmlFor="exportAnalytics" className="text-sm">Analytics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exportSettings" 
                  checked={dataSelection.settings}
                  onCheckedChange={() => handleDataSelectionChange('settings')}
                />
                <Label htmlFor="exportSettings" className="text-sm">Settings</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={exportData} 
            className="w-full"
            disabled={isLoading || !Object.values(dataSelection).some(Boolean)}
          >
            {isLoading ? (
              <span>Exporting...</span>
            ) : (
              <>
                <CloudDownload className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Upload data to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={triggerFileSelect}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json,.csv,.xlsx,.xls"
            />
            
            <CloudUpload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedFile ? selectedFile.name : 'Drag and drop your file here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports JSON, CSV, and Excel formats
            </p>
            {!selectedFile && (
              <Button variant="outline" className="mt-4">
                Select File
              </Button>
            )}
            {selectedFile && (
              <Button variant="outline" className="mt-4 bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                File Selected
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setShowRestoreDialog(true)} 
            className="w-full"
            disabled={isLoading || !selectedFile}
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your data storage and history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Data Storage</Label>
              <span className="text-sm font-medium">{storageUsage.used} GB / {storageUsage.total} GB</span>
            </div>
            <Progress value={storageUsage.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{storageUsage.percentage}% of your storage used</p>
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              {storageUsage.breakdown.map((item, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="h-2 rounded-full mb-1 mx-auto" 
                    style={{ 
                      width: '80%', 
                      backgroundColor: index === 0 ? '#3b82f6' : 
                                      index === 1 ? '#10b981' : 
                                      index === 2 ? '#f59e0b' : 
                                      '#6b7280' 
                    }}
                  ></div>
                  <p className="text-xs font-medium">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.size} GB</p>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database Backup
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBackupDialog(true)}
                >
                  Create Backup
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Last backup: 2 days ago</p>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Weekly Auto-Backup</span>
                  <span>Enabled</span>
                </div>
                <div className="flex justify-between text-muted-foreground mt-1">
                  <span>Retention Period</span>
                  <span>3 months</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Data Retention
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Configure
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Currently keeping all data</p>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Automatic Cleanup</span>
                  <span>Disabled</span>
                </div>
                <div className="flex justify-between text-muted-foreground mt-1">
                  <span>Archived Invoices</span>
                  <span>Keep Forever</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Recent Data Activities
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <div>
                    <span className="font-medium">Full Backup</span>
                    <span className="text-muted-foreground ml-2">by System</span>
                  </div>
                  <span className="text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <div>
                    <span className="font-medium">Data Export (JSON)</span>
                    <span className="text-muted-foreground ml-2">by You</span>
                  </div>
                  <span className="text-muted-foreground">1 week ago</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <div>
                    <span className="font-medium">Full Backup</span>
                    <span className="text-muted-foreground ml-2">by System</span>
                  </div>
                  <span className="text-muted-foreground">1 week ago</span>
                </div>
                <div className="flex justify-between py-1">
                  <div>
                    <span className="font-medium">Data Import (CSV)</span>
                    <span className="text-muted-foreground ml-2">by You</span>
                  </div>
                  <span className="text-muted-foreground">2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Backup Confirmation Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>
              This will create a complete backup of all your data. The process may take a few minutes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              Creating a backup will not affect your current data. This is simply a snapshot of your database.
            </div>
            
            <div className="space-y-2">
              <Label>Backup Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeFiles" defaultChecked />
                  <Label htmlFor="includeFiles" className="text-sm">Include attached files and images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="encryptBackup" defaultChecked />
                  <Label htmlFor="encryptBackup" className="text-sm">Encrypt backup (recommended)</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBackupDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={createBackup}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Backup...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import/Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              You are about to import data from {selectedFile?.name}. Please confirm how you want to handle this import.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
              <strong>Warning:</strong> Importing data may modify or overwrite existing records. Consider creating a backup before proceeding.
            </div>
            
            <div className="space-y-2">
              <Label>Import Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="mergeData" defaultChecked />
                  <Label htmlFor="mergeData" className="text-sm">Merge with existing data (recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="skipDuplicates" defaultChecked />
                  <Label htmlFor="skipDuplicates" className="text-sm">Skip duplicate entries</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRestoreDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={importData}
              disabled={isLoading}
            >
              {isLoading ? 'Importing...' : 'Import Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSettings;
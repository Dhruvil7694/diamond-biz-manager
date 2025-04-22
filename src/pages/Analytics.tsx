import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, Tag, Wallet, BarChart3, PieChart, Users, TrendingUp, Calendar, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, parseISO, isSameDay, isAfter, isBefore, subMonths } from 'date-fns';
import MarketRateForm from '@/components/MarketRateForm';
import { useTheme } from '@/contexts/ThemeContext';
import EnhancedTopClientsChart from '@/components/EnhancedTopClientsChart';

// StatCard component for displaying key metrics
const StatCard = ({ title, value, description, icon, trend }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Card className="overflow-hidden shadow-md dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{description}</p>
            )}
            {trend && (
              <p className={`text-xs flex items-center mt-2 ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </p>
            )}
          </div>
          <div className="bg-primary/10 dark:bg-primary/5 p-3 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { diamonds, clients, marketRates, invoices } = useData();
  const [timeRange, setTimeRange] = useState('30');
  const [selectedClientId, setSelectedClientId] = useState('all');
  const { isDarkMode } = useTheme();
  
  // Date filters for time-based analysis
  const today = new Date();
  const startDate = subDays(today, parseInt(timeRange));
  
  // Filter diamonds and invoices by date range and selected client
  const filteredDiamonds = diamonds.filter(d => {
    const entryDate = parseISO(d.entryDate);
    const dateMatches = isAfter(entryDate, startDate) || isSameDay(entryDate, startDate);
    const clientMatches = selectedClientId === 'all' || d.clientId === selectedClientId;
    return dateMatches && clientMatches;
  });
  
  const filteredInvoices = invoices.filter(i => {
    const issueDate = parseISO(i.issueDate);
    const dateMatches = isAfter(issueDate, startDate) || isSameDay(issueDate, startDate);
    const clientMatches = selectedClientId === 'all' || i.clientId === selectedClientId;
    return dateMatches && clientMatches;
  });
  
  // Get client-specific data if a client is selected
  const selectedClient = selectedClientId !== 'all' ? clients.find(c => c.id === selectedClientId) : null;
  
  // Filter diamonds by category (based on client selection or all)
  const relevantDiamonds = selectedClientId === 'all' ? diamonds : diamonds.filter(d => d.clientId === selectedClientId);
  const fourPPlus = relevantDiamonds.filter(d => d.category === '4P Plus');
  const fourPMinus = relevantDiamonds.filter(d => d.category === '4P Minus');
  
  // Client rate data
  const clientRatesData = clients.map(client => ({
    name: client.name,
    '4P Plus': client.rates.fourPPlus,
    '4P Minus': client.rates.fourPMinus,
    differential: client.rates.fourPPlus - client.rates.fourPMinus
  }));
  
  // Selected client rates or average rates if all clients selected
  const displayedRates = selectedClient 
    ? {
        fourPPlus: selectedClient.rates.fourPPlus,
        fourPMinus: selectedClient.rates.fourPMinus,
        differential: selectedClient.rates.fourPPlus - selectedClient.rates.fourPMinus
      }
    : {
        fourPPlus: clients.reduce((acc, c) => acc + c.rates.fourPPlus, 0) / (clients.length || 1),
        fourPMinus: clients.reduce((acc, c) => acc + c.rates.fourPMinus, 0) / (clients.length || 1),
        differential: clients.reduce((acc, c) => acc + (c.rates.fourPPlus - c.rates.fourPMinus), 0) / (clients.length || 1)
      };
  
  // Category distribution data
  const categoryData = [
    { name: '4P Plus', value: fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
    { name: '4P Minus', value: fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
  ];
  
  // Total value by category
  const categoryValueData = [
    {
      name: '4P Plus',
      value: fourPPlus.reduce((acc, d) => acc + d.totalValue, 0),
    },
    {
      name: '4P Minus',
      value: fourPMinus.reduce((acc, d) => acc + d.totalValue, 0),
    },
  ];
  
  // Client distribution data
  const clientDistributionMap = relevantDiamonds.reduce((acc, diamond) => {
    const client = clients.find(c => c.id === diamond.clientId)?.name || 'Unknown';
    if (!acc[client]) {
      acc[client] = 0;
    }
    acc[client] += diamond.totalValue;
    return acc;
  }, {} as Record<string, number>);
  
  const clientDistributionData = Object.entries(clientDistributionMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 clients
  
  // Daily diamond trend for the selected time range
  const dailyData = Array.from({ length: parseInt(timeRange) }, (_, i) => {
    const date = subDays(today, parseInt(timeRange) - 1 - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    const dayDiamonds = relevantDiamonds.filter(d => {
      const entryDate = new Date(d.entryDate);
      return format(entryDate, 'yyyy-MM-dd') === dateString;
    });
    
    const dayInvoices = selectedClientId === 'all' 
      ? invoices.filter(inv => {
          const issueDate = new Date(inv.issueDate);
          return format(issueDate, 'yyyy-MM-dd') === dateString;
        })
      : invoices.filter(inv => {
          const issueDate = new Date(inv.issueDate);
          return format(issueDate, 'yyyy-MM-dd') === dateString && inv.clientId === selectedClientId;
        });
    
    return {
      date: format(date, 'dd MMM'),
      count: dayDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
      value: dayDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000, // Show in thousands
      invoiced: dayInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0) / 1000, // Show in thousands
    };
  });
  
  // Monthly data for weight distribution (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = subMonths(today, 5 - i);
    const monthEnd = i === 5 ? today : subMonths(today, 4 - i);
    
    const monthDiamonds = relevantDiamonds.filter(d => {
      const entryDate = new Date(d.entryDate);
      return (isAfter(entryDate, monthStart) || isSameDay(entryDate, monthStart)) && 
             (isBefore(entryDate, monthEnd) || isSameDay(entryDate, monthEnd));
    });
    
    const month4PPlus = monthDiamonds.filter(d => d.category === '4P Plus');
    const month4PMinus = monthDiamonds.filter(d => d.category === '4P Minus');
    
    return {
      month: format(monthStart, 'MMM yy'),
      "4P Plus": month4PPlus.reduce((acc, d) => acc + d.weightInKarats, 0),
      "4P Minus": month4PMinus.reduce((acc, d) => acc + d.weightInKarats, 0),
    };
  });
  
  // Pie chart colors - adjust for dark mode
  const COLORS = isDarkMode 
    ? ['#6366f1', '#a5b4fc', '#818cf8', '#c7d2fe', '#e0e7ff'] 
    : ['#4a5ee4', '#89a3f4', '#6682ef', '#b3c5f9', '#d6dffc'];
  
  // Calculate totals for stat cards based on selected client or all
  const totalDiamonds = relevantDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0);
  const totalWeight = relevantDiamonds.reduce((acc, d) => acc + d.weightInKarats, 0);
  const totalValue = relevantDiamonds.reduce((acc, d) => acc + d.totalValue, 0);
  
  // Calculate average per diamond metrics
  const avgWeightPerDiamond = totalDiamonds ? (totalWeight / totalDiamonds) : 0;
  const avgValuePerDiamond = totalDiamonds ? (totalValue / totalDiamonds) : 0;
  
  // Calculate invoice metrics for selected client or all
  const relevantInvoices = selectedClientId === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.clientId === selectedClientId);
    
  const totalInvoiced = relevantInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const paidInvoices = relevantInvoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Diamond Analytics</h1>
        <p className="text-muted-foreground dark:text-gray-400">Analyze your diamond inventory and client performance</p>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
          <span className="dark:text-gray-300">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
          <span className="dark:text-gray-300">Client:</span>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-[220px] dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Client Rate Information */}
      <Card className="bg-primary/5 dark:bg-primary/10 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center dark:text-white">
            <Tag className="mr-2 h-5 w-5" />
            {selectedClient ? `${selectedClient.name}'s Rates` : 'Average Client Rates'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">4P Plus Rate</h3>
              <p className="text-2xl font-bold mt-1 dark:text-white">₹{displayedRates.fourPPlus.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Per karat rate</p>
            </div>
            
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">4P Minus Rate</h3>
              <p className="text-2xl font-bold mt-1 dark:text-white">₹{displayedRates.fourPMinus.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Per piece rate</p>
            </div>
            
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Rate Differential</h3>
              <p className="text-2xl font-bold mt-1 dark:text-white">₹{displayedRates.differential.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Plus/Minus spread</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Diamonds"
          value={totalDiamonds.toLocaleString()}
          description={`${totalWeight.toFixed(2)} karats`}
          icon={<Gem className="h-5 w-5 text-primary" />}
          trend={{ value: 
            filteredDiamonds.length ? 
            ((filteredDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0) / totalDiamonds) * 100).toFixed(1) : 0, 
            isPositive: true }}
        />
        <StatCard 
          title="Average Per Diamond"
          value={`${avgWeightPerDiamond.toFixed(3)} K`}
          description={`₹${avgValuePerDiamond.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg. value`}
          icon={<Tag className="h-5 w-5 text-primary" />} trend={undefined}
        />
        <StatCard 
          title="Total Value"
          value={`₹${totalValue.toLocaleString('en-IN')}`}
          description={`₹${totalWeight ? (totalValue / totalWeight).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0} per karat`}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          trend={{ value: 
            totalValue ? 
            ((totalInvoiced / totalValue) * 100).toFixed(1) : 0, 
            isPositive: true }}
        />
        <StatCard 
          title="Revenue"
          value={`₹${totalInvoiced.toLocaleString('en-IN')}`}
          description={`₹${totalPaid.toLocaleString('en-IN')} received`}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          trend={{ value: 
            totalInvoiced ? 
            ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0, 
            isPositive: true }}
        />
      </div>
      
      {/* Tabs for different analysis sections */}
      <Tabs defaultValue="diamond" className="w-full mb-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-4">
          <TabsTrigger value="diamond">Diamond Analysis</TabsTrigger>
          <TabsTrigger value="client">Client Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        {/* Diamond Analysis Tab */}
        <TabsContent value="diamond" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <PieChart className="mr-2 h-5 w-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Count']} 
                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                        labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                        itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <Separator className="my-4 dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium dark:text-white">4P Plus Diamonds</h4>
                    <p className="text-2xl font-bold dark:text-white">{fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0).toFixed(2)} karats</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium dark:text-white">4P Minus Diamonds</h4>
                    <p className="text-2xl font-bold dark:text-white">{fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0).toFixed(2)} karats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Value Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Wallet className="mr-2 h-5 w-5" />
                  Value Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryValueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryValueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} 
                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                        labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                        itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Diamond Metrics */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Gem className="mr-2 h-5 w-5" />
                Diamond Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="text-sm font-medium dark:text-white">Avg 4P Plus Weight</h4>
                  <p className="text-2xl font-bold dark:text-white">
                    {fourPPlus.length && fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0
                      ? (fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0) / fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toFixed(3)
                      : '0.000'} K
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-white">Avg 4P Minus Weight</h4>
                  <p className="text-2xl font-bold dark:text-white">
                    {fourPMinus.length && fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0
                      ? (fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0) / fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toFixed(3)
                      : '0.000'} K
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-white">Avg 4P Plus Value</h4>
                  <p className="text-2xl font-bold dark:text-white">
                    ₹{fourPPlus.length && fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0) > 0
                      ? (fourPPlus.reduce((acc, d) => acc + d.totalValue, 0) / fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      : '0'}/K
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium dark:text-white">Avg 4P Minus Value</h4>
                  <p className="text-2xl font-bold dark:text-white">
                    ₹{fourPMinus.length && fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0
                      ? (fourPMinus.reduce((acc, d) => acc + d.totalValue, 0) / fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      : '0'}/pc
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Client Analysis Tab */}
        <TabsContent value="client" className="space-y-4">
          {selectedClientId === 'all' ? (
            <>
              {/* Top Clients */}
              {/* Enhanced Top Clients Chart */}
<EnhancedTopClientsChart 
  clientDistributionData={clientDistributionData.map(item => ({
    ...item,
    id: clients.find(c => c.name === item.name)?.id || 'unknown'
  }))}
  totalValue={relevantDiamonds.reduce((acc, d) => acc + d.totalValue, 0)}
  isDarkMode={isDarkMode}
  timeRange={timeRange}
  onClientSelect={(clientId) => setSelectedClientId(clientId)}
/>
            
              {/* Client Rates Comparison */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Tag className="mr-2 h-5 w-5" />
                    Client Rate Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={clientRatesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#dddddd"} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                        <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                          contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                          labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                          itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? 'white' : 'black' }} />
                        <Bar dataKey="4P Plus" name="4P Plus Rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="4P Minus" name="4P Minus Rate" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="differential" name="Rate Differential" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Individual Client Analysis */
            <>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-white">
                    <Users className="mr-2 h-5 w-5" />
                    {selectedClient?.name} Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Diamond Distribution</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [value.toLocaleString(), 'Count']} 
                              contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                              labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                              itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Value Distribution</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={categoryValueData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryValueData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} 
                              contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                              labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                              itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6 dark:bg-gray-700" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Diamonds</h3>
                      <p className="text-2xl font-bold mt-1 dark:text-white">{totalDiamonds.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                        {totalWeight.toFixed(2)} karats total
                      </p>
                    </div>
                    
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Value</h3>
                      <p className="text-2xl font-bold mt-1 dark:text-white">₹{totalValue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                        ₹{avgValuePerDiamond.toLocaleString('en-IN', { maximumFractionDigits: 0 })} avg. per diamond
                      </p>
                    </div>
                    
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Outstanding Balance</h3>
                      <p className="text-2xl font-bold mt-1 dark:text-white">
                        ₹{(totalInvoiced - totalPaid).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                        {((totalPaid / totalInvoiced) * 100).toFixed(1)}% paid
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Diamond Flow */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Daily Diamond Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#dddddd"} />
                      <XAxis dataKey="date" stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                      <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                      <Tooltip 
                        formatter={(value) => [value, '']} 
                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                        labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                        itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                      />
                      <Legend wrapperStyle={{ color: isDarkMode ? 'white' : 'black' }} />
                      <Line type="monotone" dataKey="count" name="Diamond Count" stroke="#6366f1" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Value Flow */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <Activity className="mr-2 h-5 w-5" />
                  Daily Value & Invoice Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#dddddd"} />
                      <XAxis dataKey="date" stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                      <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                      <Tooltip 
                        formatter={(value) => [`₹${value}K`, '']} 
                        contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                        labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                        itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                      />
                      <Legend wrapperStyle={{ color: isDarkMode ? 'white' : 'black' }} />
                      <Area type="monotone" dataKey="value" name="Diamond Value (₹000s)" stroke="#6366f1" fill="#6366f180" />
                      <Area type="monotone" dataKey="invoiced" name="Invoiced Amount (₹000s)" stroke="#a5b4fc" fill="#a5b4fc80" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Category Weight Distribution */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <BarChart3 className="mr-2 h-5 w-5" />
                Monthly Category Weight Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#dddddd"} />
                    <XAxis dataKey="month" stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#374151"} />
                    <Tooltip 
                      formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(2) : value} karats`, '']}
                      contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', borderColor: isDarkMode ? '#374151' : '#dddddd' }}
                      labelStyle={{ color: isDarkMode ? 'white' : 'black' }}
                      itemStyle={{ color: isDarkMode ? 'white' : 'black' }}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? 'white' : 'black' }} />
                    <Bar dataKey="4P Plus" name="4P Plus" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="4P Minus" name="4P Minus" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Market Rate Form Section - Show only for admin users or when specifically viewing rates */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center dark:text-white">
            <Tag className="mr-2 h-5 w-5" />
            Update Market Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarketRateForm />
        </CardContent>
      </Card>
      
      {/* Dark Mode Toggle - for testing purposes
      <div className="flex justify-end mt-8">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-theme'))}
          className="flex items-center px-4 py-2 rounded-md bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground"
        >
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div> */}
    </div>
  );
};

export default Analytics;
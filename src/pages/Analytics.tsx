
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/common/StatCard';
import { Gem, Tag, Wallet, BarChart3, PieChart } from 'lucide-react';
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
} from 'recharts';
import { format, subDays } from 'date-fns';

const Analytics = () => {
  const { diamonds, clients } = useData();
  
  // Diamond category distribution
  const fourPPlus = diamonds.filter(d => d.category === '4P Plus');
  const fourPMinus = diamonds.filter(d => d.category === '4P Minus');
  
  const categoryData = [
    { name: '4P Plus', value: fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
    { name: '4P Minus', value: fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
  ];
  
  // Client distribution data
  const clientDistributionMap = diamonds.reduce((acc, diamond) => {
    const client = clients.find(c => c.id === diamond.clientId)?.name || 'Unknown';
    if (!acc[client]) {
      acc[client] = 0;
    }
    acc[client] += diamond.totalValue;
    return acc;
  }, {} as Record<string, number>);
  
  const clientDistributionData = Object.entries(clientDistributionMap).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Past 30 days trend
  const today = new Date();
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    const dayDiamonds = diamonds.filter(
      d => d.entryDate.split('T')[0] === dateString
    );
    
    return {
      date: format(date, 'dd MMM'),
      count: dayDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
      value: dayDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000, // Show in thousands
    };
  });
  
  // Category distribution by value
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
  
  // Weight distribution by month (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = today.getMonth();
  
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return monthNames[monthIndex];
  }).reverse();
  
  const weightByMonthData = last6Months.map(month => {
    // In a real app, we'd filter by actual date ranges
    // This is a simulation for the demo
    const random4PPlus = Math.floor(Math.random() * 50) + 10;
    const random4PMinus = Math.floor(Math.random() * 30) + 5;
    
    return {
      month,
      "4P Plus": random4PPlus,
      "4P Minus": random4PMinus,
      total: random4PPlus + random4PMinus,
    };
  });
  
  // Pie chart colors
  const COLORS = ['#4a5ee4', '#89a3f4', '#6682ef', '#b3c5f9', '#d6dffc'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-diamond-900">Analytics</h1>
        <p className="text-muted-foreground">Analyze your diamond business performance</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Diamonds"
          value={diamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0)}
          description={`${diamonds.reduce((acc, d) => acc + d.weightInKarats, 0).toFixed(2)} karats`}
          icon={<Gem className="h-5 w-5" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard 
          title="Average Per Diamond"
          value={`${(diamonds.reduce((acc, d) => acc + d.weightInKarats, 0) / 
                   diamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toFixed(3)} K`}
          icon={<Tag className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Value"
          value={`$${diamonds.reduce((acc, d) => acc + d.totalValue, 0).toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatCard 
          title="Avg. Value per Karat"
          value={`$${(diamonds.reduce((acc, d) => acc + d.totalValue, 0) / 
                     diamonds.reduce((acc, d) => acc + d.weightInKarats, 0)).toFixed(2)}`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>
      
      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 30 Day Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">30 Day Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4a5ee4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#89a3f4" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    name="Diamond Count"
                    stroke="#4a5ee4"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="value"
                    name="Value ($k)"
                    stroke="#89a3f4"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                  <Tooltip formatter={(value: number) => [value, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weight by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="4P Plus" fill="#4a5ee4" />
                  <Bar dataKey="4P Minus" fill="#89a3f4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={clientDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {clientDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

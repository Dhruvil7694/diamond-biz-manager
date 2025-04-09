
import React from 'react';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Gem, Users, Coins, Briefcase, Wallet } from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { diamonds, clients, marketRates } = useData();
  
  // Calculate total inventory
  const totalDiamonds = diamonds.reduce((acc, diamond) => acc + diamond.numberOfDiamonds, 0);
  const totalWeight = diamonds.reduce((acc, diamond) => acc + diamond.weightInKarats, 0).toFixed(2);
  const totalValue = diamonds.reduce((acc, diamond) => acc + diamond.totalValue, 0);
  
  // Recent transactions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTransactions = diamonds.filter(
    d => new Date(d.entryDate) >= sevenDaysAgo
  );
  const recentValue = recentTransactions.reduce((acc, d) => acc + d.totalValue, 0);
  
  // Calculate category distribution
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
  
  // Past 5 days trend data
  const pastDaysData = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayDiamonds = diamonds.filter(
      d => d.entryDate.split('T')[0] === dateString
    );
    
    return {
      date: dateString,
      count: dayDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
      value: dayDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000, // Show in thousands
    };
  }).reverse();
  
  // Pie chart colors
  const COLORS = ['#4a5ee4', '#89a3f4', '#6682ef', '#b3c5f9', '#d6dffc'];
  
  // Current market rate
  const currentMarketRate = marketRates[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-diamond-900">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your diamond business dashboard</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Diamonds"
          value={totalDiamonds}
          description={`${totalWeight} karats`}
          icon={<Gem className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Clients"
          value={clients.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard 
          title="Recent Transactions"
          value={`$${recentValue.toLocaleString()}`}
          description="Last 7 days"
          icon={<Coins className="h-5 w-5" />}
        />
      </div>
      
      {/* Market Rates */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Current Market Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard 
            title="4P Plus Rate"
            value={`$${currentMarketRate?.fourPPlusRate?.toLocaleString() || 'N/A'}`}
            description="Per karat"
            className="border-l-4 border-diamond-600"
          />
          <StatCard 
            title="4P Minus Rate"
            value={`$${currentMarketRate?.fourPMinusRate?.toLocaleString() || 'N/A'}`}
            description="Per piece"
            className="border-l-4 border-diamond-400"
          />
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5" />
              Inventory Trend (Last 5 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pastDaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4a5ee4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#89a3f4" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Diamond Count" fill="#4a5ee4" />
                  <Bar yAxisId="right" dataKey="value" name="Value ($k)" fill="#89a3f4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Client Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Client Distribution
            </CardTitle>
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
                    label={({name}) => name}
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

export default Dashboard;

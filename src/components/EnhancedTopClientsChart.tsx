// Enhanced Top Client Chart Component
// This component can replace the existing client distribution chart in the Analytics component

import React, { useState, useCallback } from 'react';
import { Users, ArrowUpRight, Info, DollarSign, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// Custom active shape for the pie chart with enhanced interactivity
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={fill}>
        ₹{value.toLocaleString('en-IN')}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill={fill}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, isDarkMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className={`p-3 rounded-md shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{data.name}</p>
        <div className="flex items-center mt-1">
          <DollarSign className="h-4 w-4 mr-1 text-primary" />
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            ₹{data.value.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center mt-1">
          <Percent className="h-4 w-4 mr-1 text-primary" />
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            {(data.percent * 100).toFixed(1)}% of total
          </p>
        </div>
        {data.trend && (
          <div className="flex items-center mt-1">
            <ArrowUpRight className={`h-4 w-4 mr-1 ${data.trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <p className={`${data.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.trend > 0 ? '+' : ''}{data.trend}% from previous period
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Enhanced Top Clients Chart component
const EnhancedTopClientsChart = ({ 
  clientDistributionData, 
  totalValue, 
  isDarkMode,
  timeRange,
  onClientSelect
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Colors with better contrast for dark mode
  const COLORS = isDarkMode 
    ? ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'] 
    : ['#4f46e5', '#7c3aed', '#be185d', '#0f766e', '#ea580c'];
    
  // Calculate percentages and add to data
  const dataWithPercentage = clientDistributionData.map(item => ({
    ...item,
    percent: item.value / totalValue,
    // Added mock trend data (would come from actual data in real implementation)
    trend: Math.round((Math.random() * 20) - 10)
  }));
  
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  // Get sum of remaining clients not in top 5
  const otherClientsValue = totalValue - dataWithPercentage.reduce((acc, client) => acc + client.value, 0);
  const otherClientsPercent = otherClientsValue / totalValue;
  
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            <CardTitle className="dark:text-white">Top Clients by Value</CardTitle>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Information</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className={isDarkMode ? "dark:bg-gray-800 dark:border-gray-700" : ""}>
              <p className="text-sm">
                This chart shows the top 5 clients by diamond value for the selected time period.
                Click on a segment to view detailed client analytics.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
        <CardDescription className="dark:text-gray-400">
          {timeRange === '7' ? 'Last 7 days' : 
           timeRange === '30' ? 'Last 30 days' : 
           timeRange === '90' ? 'Last 90 days' : 
           timeRange === '180' ? 'Last 6 months' : 'Last year'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-[350px]" aria-label="Top clients pie chart" role="img">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onClick={(data) => onClientSelect && onClientSelect(data.id)}
                paddingAngle={2}
                cornerRadius={4}
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={isDarkMode ? "#1f1f1f" : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip isDarkMode={isDarkMode} active={undefined} payload={undefined} />} 
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                formatter={(value, entry, index) => (
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t dark:border-gray-700 pt-4">
        <div className="flex items-center">
          <Badge variant="outline" className={isDarkMode ? "dark:border-gray-600" : ""}>
            {dataWithPercentage.length} of {dataWithPercentage.length + (otherClientsValue > 0 ? 1 : 0)} clients shown
          </Badge>
        </div>
        
        {otherClientsValue > 0 && (
          <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
            <span className="mr-2">Other clients:</span>
            <span className="font-medium">₹{otherClientsValue.toLocaleString('en-IN')} ({(otherClientsPercent * 100).toFixed(1)}%)</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedTopClientsChart;
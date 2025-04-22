import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Gem, 
  Users, 
  Coins, 
  Wallet,
  Tag,
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Check,
  ChevronsUp,
  ChevronsDown,
  Diamond,
  Sparkles,
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Area,
  AreaChart,
  Brush,
  Scatter,
  ScatterChart,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  Sector
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, subDays, differenceInDays, addDays, isAfter } from 'date-fns';
import { useViewport, Breakpoint } from '@/contexts/ViewportContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';


/**
 * Enhanced StatCard with animations, trend indicators, and better UI
 */
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend = null, 
  className = "", 
  onClick = null,
  secondaryValue = null
}) => {
  const { isDarkMode } = useTheme();
  
  const cardVariants = {
    hover: { 
      y: -4,
      boxShadow: isDarkMode 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
    },
    initial: { 
      y: 0,
      boxShadow: isDarkMode
        ? '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
  };
  
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-full",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <Card className={cn(
        `overflow-hidden border h-full transition-all duration-200`,
        isDarkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white',
        className
      )}>
        <CardContent className="p-4 sm:p-6 h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className={cn(
                  `text-xs sm:text-sm font-medium`,
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {title}
                </p>
                <h3 className={cn(
                  `text-xl sm:text-2xl font-semibold`,
                  isDarkMode ? 'text-white' : 'text-gray-900'
                )}>
                  {value}
                </h3>
                {secondaryValue && (
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    {secondaryValue}
                  </p>
                )}
              </div>
              <div className={cn(
                `rounded-full p-2 sm:p-3 flex items-center justify-center`,
                isDarkMode 
                  ? 'bg-indigo-900/30 text-indigo-400' 
                  : 'bg-indigo-50 text-indigo-600'
              )}>
                {icon}
              </div>
            </div>
            
            <div className="mt-auto pt-2">
              {description && (
                <p className={cn(
                  `text-xs`,
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {description}
                </p>
              )}
              
              {trend && (
                <div className={cn(
                  `mt-2 text-xs flex items-center gap-1`,
                  trend.isPositive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                )}>
                  {trend.isPositive 
                    ? <TrendingUp className="h-3 w-3" /> 
                    : <TrendingDown className="h-3 w-3" />
                  }
                  <span className="font-medium">{trend.value}%</span>
                  <span className={cn(
                    isDarkMode ? 'text-gray-400' : 'text-gray-500',
                    "ml-1"
                  )}>
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const renderActiveShape = (props, valueType) => {
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

  // Format value based on type
  let formattedValue;
  if (valueType === 'Value') {
    formattedValue = `₹${typeof value === 'number' ? value.toLocaleString('en-IN') : value}`;
  } else if (valueType === 'Weight') {
    formattedValue = `${typeof value === 'number' ? value.toFixed(2) : value} carats`;
  } else {
    formattedValue = `${value}`;
  }

  // Scale font size based on space
  const fontSize = props.isMobile ? 10 : 12;
  const nameYOffset = props.isMobile ? -10 : -15;
  const valueYOffset = props.isMobile ? 5 : 8;
  const percentYOffset = props.isMobile ? 15 : 20;

  return (
    <g>
      <text x={cx} y={cy + nameYOffset} dy={8} textAnchor="middle" fill={fill} fontSize={fontSize} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + valueYOffset} textAnchor="middle" fill={fill} fontSize={fontSize}>
        {formattedValue}
      </text>
      <text x={cx} y={cy + percentYOffset} textAnchor="middle" fill={fill} fontSize={fontSize}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 8}
        fill={fill}
      />
    </g>
  );
};

// Custom tooltip component for pie charts
const CustomTooltip = ({ active, payload, isDarkMode, isMobile, valueType, formatter }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedValue = formatter ? formatter(data.value) : data.value;
    
    return (
      <div 
        className={`p-2 rounded-md shadow-md ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        style={{
          fontSize: isMobile ? '11px' : '12px',
        }}
      >
        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {data.name}
        </p>
        <div className="flex items-center mt-1">
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            {formattedValue}
          </p>
        </div>
        <div className="flex items-center mt-1">
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            {(data.percent * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const renderClientActiveShape = (props, isMobile) => {
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

  // Format value as currency
  const formattedValue = `₹${value.toLocaleString('en-IN')}`;
  
  // Scale font size based on space
  const fontSize = isMobile ? 10 : 12;
  const titleFontSize = isMobile ? 12 : 14;
  const nameYOffset = isMobile ? -15 : -20;
  const valueYOffset = isMobile ? 5 : 8;
  const percentYOffset = isMobile ? 20 : 30;

  return (
    <g>
      <text 
        x={cx} 
        y={cy + nameYOffset} 
        dy={8} 
        textAnchor="middle" 
        fill={fill} 
        fontSize={titleFontSize} 
        fontWeight="bold"
      >
        {payload.name.length > (isMobile ? 10 : 15) 
          ? `${payload.name.substring(0, isMobile ? 10 : 15)}...` 
          : payload.name}
      </text>
      <text 
        x={cx} 
        y={cy + valueYOffset} 
        textAnchor="middle" 
        fill={fill} 
        fontSize={fontSize}
      >
        {formattedValue}
      </text>
      <text 
        x={cx} 
        y={cy + percentYOffset} 
        textAnchor="middle" 
        fill={fill} 
        fontSize={fontSize}
      >
        {(percent * 100).toFixed(1)}% of total
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + (isMobile ? 3 : 5)}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + (isMobile ? 5 : 8)}
        outerRadius={outerRadius + (isMobile ? 7 : 10)}
        fill={fill}
      />
    </g>
  );
};


// Custom tooltip for client pie chart
const ClientTooltip = ({ active, payload, isDarkMode, isMobile }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div 
        className={`p-2 rounded-md shadow-md ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        style={{
          fontSize: isMobile ? '11px' : '12px',
        }}
      >
        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {data.name}
        </p>
        <div className="flex items-center mt-1">
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            ₹{data.value.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center mt-1">
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            {(data.percent * 100).toFixed(1)}% of total
          </p>
        </div>
      </div>
    );
  }
  return null;
};


// Custom tooltip for client bar chart
const ClientBarTooltip = ({ active, payload, isDarkMode, isMobile }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div 
        className={`p-2 rounded-md shadow-md ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        style={{
          fontSize: isMobile ? '11px' : '12px',
        }}
      >
        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {data.name}
        </p>
        <div className="flex flex-col mt-1">
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            Value: ₹{data.value.toLocaleString('en-IN')}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Click to view client details
          </p>
        </div>
      </div>
    );
  }
  return null;
};



// Initial state for active chart indices
const initialActiveChartIndices = {
  countChart: 0,
  weightChart: 0,
  valueChart: 0
};
/**
 * Enhanced ClientRateCard with advanced visualizations, animations, and metrics
 */
const ClientRateCard = ({ 
  title, 
  rate, 
  description, 
  change = null, 
  icon,
  badgeText = null,
  badgeColor = null,
  className = "",
  footer = null
}) => {
  const { isDarkMode } = useTheme();
  
  // Calculate trend direction for the icon display
  const getTrendDirection = () => {
    if (!change) return 'neutral';
    const changeNum = Number(change);
    if (changeNum > 0) return 'up';
    if (changeNum < 0) return 'down';
    return 'neutral';
  };
  
  // Get trend percentage from change
  const getTrendPercentage = () => {
    if (!change) return '0';
    return Math.abs(Number(change)).toFixed(1);
  };
  
  const cardVariants = {
    hover: { 
      y: -4,
      boxShadow: isDarkMode 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
    },
    initial: { 
      y: 0,
      boxShadow: isDarkMode
        ? '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
  };
  
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn(
        "border-0 shadow-md overflow-hidden h-full",
        isDarkMode 
          ? 'bg-gradient-to-br from-indigo-900/20 via-gray-800 to-gray-800/95 dark:border-gray-700' 
          : 'bg-gradient-to-br from-indigo-50 via-white to-white',
        className
      )}>
        <CardHeader className="pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className={cn(
            `text-base sm:text-lg font-medium`,
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          )}>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                {title}
                {badgeText && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-2 text-xs",
                      badgeColor
                    )}
                  >
                    {badgeText}
                  </Badge>
                )}
              </span>
              {change !== null && (
                <div className={cn(
                  `px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1`,
                  Number(change) >= 0 
                    ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                )}>
                  {Number(change) >= 0 
                    ? <TrendingUp className="h-3 w-3" /> 
                    : <TrendingDown className="h-3 w-3" />
                  }
                  <span>{Math.abs(Number(change))}%</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="mt-2">
            <div className={cn(
              `text-xl sm:text-2xl md:text-3xl font-bold`,
              isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
            )}>
              ₹{rate.toLocaleString('en-IN')}
            </div>
            <p className={cn(
              `text-xs`,
              isDarkMode ? 'text-gray-400' : 'text-gray-500',
              "mt-1"
            )}>
              {description}
            </p>
          </div>
          
          <div className="relative mt-2 sm:mt-4 h-16 sm:h-24 overflow-hidden">
            {/* Sparkline chart */}
            {icon}
            
            {/* Decorative elements */}
            <div className="absolute top-1 right-1 h-2 w-2 bg-indigo-500 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-3 right-3 h-1 w-1 bg-indigo-300 rounded-full opacity-40"></div>
            
            {/* Enhanced trend indicator */}
            <div className="absolute bottom-1 right-1 flex items-center text-xs font-medium">
              <span className={cn(
                "flex items-center",
                getTrendDirection() === 'up' 
                  ? 'text-emerald-500' 
                  : getTrendDirection() === 'down' 
                    ? 'text-rose-500'
                    : 'text-gray-400'
              )}>
                {getTrendDirection() === 'up' 
                  ? <ChevronsUp className="h-3 w-3" /> 
                  : getTrendDirection() === 'down'
                    ? <ChevronsDown className="h-3 w-3" />
                    : null
                }
                {getTrendDirection() !== 'neutral' && (
                  <span className="ml-0.5">{getTrendPercentage()}%</span>
                )}
              </span>
            </div>
          </div>
          
          {footer && (
            <div className="mt-2">
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced category card with better metrics and visualizations
 */
const CategoryCard = ({ 
  title, 
  icon, 
  metrics = [], 
  chart = null, 
  className = "",
  isDarkMode = false
}) => {
  return (
    <Card className={cn(
      `border-0 shadow-md overflow-hidden`,
      isDarkMode ? 'dark:bg-gray-800 dark:border-gray-700' : '',
      className
    )}>
      <CardHeader className={cn(
        `pb-2 border-b px-4 sm:px-6 py-3 sm:py-4`,
        isDarkMode ? 'bg-indigo-900/20 border-gray-700' : 'bg-indigo-50'
      )}>
        <CardTitle className={cn(
          `text-base sm:text-lg font-medium flex items-center`,
          isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
        )}>
          <div className={cn(
            `h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center mr-2`,
            isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'
          )}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={cn(
                `p-2 sm:p-3 rounded-lg`,
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              )}
            >
              <p className={cn(
                `text-xs font-medium`,
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}>
                {metric.label}
              </p>
              <p className={cn(
                `text-base sm:text-lg font-bold`,
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}>
                {metric.value}
              </p>
              {metric.subtext && (
                <p className={cn(
                  `text-xs mt-0.5`,
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {metric.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {chart && (
          <div className="h-32 sm:h-44">
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Enhanced analysis card for chart displays
 */
const AnalysisCard = ({
  title,
  icon,
  description = null,
  children,
  className = "",
  isDarkMode = false,
  headerAction = null
}) => {
  return (
    <div className={cn(
      isDarkMode ? 'bg-gray-700' : 'bg-white',
      'p-3 sm:p-4 rounded-lg shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className={cn(
          `text-xs sm:text-sm font-medium flex items-center`,
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        )}>
          {icon && (
            <span className={cn(
              "mr-1 sm:mr-2",
              isDarkMode ? "text-indigo-400" : "text-indigo-500"
            )}>
              {icon}
            </span>
          )}
          {title}
        </h3>
        
        {headerAction && (
          <div>
            {headerAction}
          </div>
        )}
      </div>
      
      {description && (
        <p className={cn(
          "text-xs mb-3",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {description}
        </p>
      )}
      
      <div>
        {children}
      </div>
    </div>
  );
};

// Helper function to determine rate categories
const getRateCategory = (rate) => {
  if (rate > 10000) return "Premium";
  if (rate > 5000) return "Standard";
  return "Basic";
};

// Helper function to get color for rate categories
const getRateCategoryColor = (rate, isDarkMode = false) => {
  if (rate > 10000) {
    return isDarkMode ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-800";
  }
  if (rate > 5000) {
    return isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800";
  }
  return isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800";
};

// Helper function to get market comparison text
const getComparisonText = (rate, marketAvg) => {
  const diff = rate - marketAvg;
  const percentageValue = (diff / marketAvg) * 100;
  const percentage = percentageValue.toFixed(1);
  
  if (diff > 0) {
    return `${percentage}% above market`;
  } else if (diff < 0) {
    return `${Math.abs(percentageValue).toFixed(1)}% below market`;
  }
  return "At market rate";
};

// Helper function to get comparison class for styling
const getComparisonClass = (rate, marketAvg, isDarkMode = false) => {
  const diff = rate - marketAvg;
  
  if (diff > 0) {
    return isDarkMode ? "text-green-400" : "text-green-600";
  } else if (diff < 0) {
    return isDarkMode ? "text-amber-400" : "text-amber-600";
  }
  return isDarkMode ? "text-gray-400" : "text-gray-600";
};

// Helper function to get market average
const getMarketAverage = (rates, category = '4P Plus') => {
  if (!rates || rates.length === 0) return 0;
  
  if (category === '4P Plus') {
    return Math.round(rates.reduce((sum, rate) => sum + rate.fourPPlus, 0) / rates.length);
  } else {
    return Math.round(rates.reduce((sum, rate) => sum + rate.fourPMinus, 0) / rates.length);
  }
};

/**
 * Main Dashboard Component with enhanced visualizations
 */
const Dashboard = () => {
  const { diamonds, clients, invoices } = useData();
  const [timeframe, setTimeframe] = useState('week'); // week, month, quarter
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [activeChartTab, setActiveChartTab] = useState('inventory');
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, breakpoint } = useViewport();
  const { isDarkMode } = useTheme();
  const [activeClientChartIndex, setActiveClientChartIndex] = useState(0);


  const [activeChartIndices, setActiveChartIndices] = useState({
    countChart: 0,
    weightChart: 0,
    valueChart: 0
  });
  
  // Time periods based on selected timeframe
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        return { startDate, endDate, days: 7 };
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        return { startDate, endDate, days: 30 };
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        return { startDate, endDate, days: 90 };
      default:
        startDate.setDate(startDate.getDate() - 7);
        return { startDate, endDate, days: 7 };
    }
  };

    // Client selection handler
    const handleClientSelect = (clientIdOrName) => {
      // Find client ID if name was provided
      if (typeof clientIdOrName === 'string' && !clientIdOrName.startsWith('client-')) {
        const client = clients.find(c => c.name === clientIdOrName);
        if (client) {
          setSelectedClientId(client.id);
          // Optionally navigate to client view using programmatic navigation
          // instead of direct DOM manipulation
        }
      } else {
        // Direct ID provided
        setSelectedClientId(clientIdOrName);
        // Optionally navigate using programmatic navigation 
        // instead of direct DOM manipulation
      }
    };
  
  const { startDate, endDate, days } = getDateRange();
  
  // Filter based on selected client
  const relevantDiamonds = useMemo(() => 
    selectedClientId === 'all' 
      ? diamonds 
      : diamonds.filter(d => d.clientId === selectedClientId),
    [diamonds, selectedClientId]
  );
    
  // Recent transactions based on timeframe and selected client
  const recentTransactions = useMemo(() => 
    relevantDiamonds.filter(d => {
      const entryDate = new Date(d.entryDate);
      return entryDate >= startDate && entryDate <= endDate;
    }),
    [relevantDiamonds, startDate, endDate]
  );
  
  const recentValue = useMemo(() => 
    recentTransactions.reduce((acc, d) => acc + d.totalValue, 0),
    [recentTransactions]
  );
  
  // Filter invoices based on client
  const relevantInvoices = useMemo(() => 
    selectedClientId === 'all'
      ? invoices
      : invoices.filter(inv => inv.clientId === selectedClientId),
    [invoices, selectedClientId]
  );
    
  const recentInvoices = useMemo(() => 
    relevantInvoices.filter(inv => {
      const issueDate = new Date(inv.issueDate);
      return issueDate >= startDate && issueDate <= endDate;
    }),
    [relevantInvoices, startDate, endDate]
  );
  
  // Calculate totals for the selected client or all clients
  const totalDiamonds = useMemo(() => 
    relevantDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
    [relevantDiamonds]
  );
  
  const totalWeight = useMemo(() => 
    relevantDiamonds.reduce((acc, d) => acc + d.weightInKarats, 0),
    [relevantDiamonds]
  );
  
  const totalValue = useMemo(() => 
    relevantDiamonds.reduce((acc, d) => acc + d.totalValue, 0),
    [relevantDiamonds]
  );
  
  // Calculate 4P distributions
  const fourPPlus = useMemo(() => 
    relevantDiamonds.filter(d => d.category === '4P Plus'),
    [relevantDiamonds]
  );
  
  const fourPMinus = useMemo(() => 
    relevantDiamonds.filter(d => d.category === '4P Minus'),
    [relevantDiamonds]
  );
  
  const categoryData = useMemo(() => [
    { name: '4P Plus', value: fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
    { name: '4P Minus', value: fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) },
  ], [fourPPlus, fourPMinus]);
  
  // Diamond weight distribution by category
  const weightDistributionData = useMemo(() => [
    { name: '4P Plus', value: fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0) },
    { name: '4P Minus', value: fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0) },
  ], [fourPPlus, fourPMinus]);
  
  // Diamond value distribution by category
  const valueDistributionData = useMemo(() => [
    { name: '4P Plus', value: fourPPlus.reduce((acc, d) => acc + d.totalValue, 0) },
    { name: '4P Minus', value: fourPMinus.reduce((acc, d) => acc + d.totalValue, 0) },
  ], [fourPPlus, fourPMinus]);
  
  // 4P Stats
  const fourPPlusStats = useMemo(() => ({
    count: fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
    weight: fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0).toFixed(2),
    value: fourPPlus.reduce((acc, d) => acc + d.totalValue, 0),
    avgPricePerCarat: fourPPlus.length && fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0) > 0
      ? (fourPPlus.reduce((acc, d) => acc + d.totalValue, 0) / 
         fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0)).toFixed(2) 
      : 0,
    avgWeightPerDiamond: fourPPlus.length && fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0
      ? (fourPPlus.reduce((acc, d) => acc + d.weightInKarats, 0) /
         fourPPlus.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toFixed(3)
      : 0
  }), [fourPPlus]);
  
  const fourPMinusStats = useMemo(() => ({
    count: fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
    weight: fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0).toFixed(2),
    value: fourPMinus.reduce((acc, d) => acc + d.totalValue, 0),
    avgPricePerCarat: fourPMinus.length && fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0) > 0
      ? (fourPMinus.reduce((acc, d) => acc + d.totalValue, 0) / 
         fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0)).toFixed(2) 
      : 0,
    avgWeightPerDiamond: fourPMinus.length && fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0
      ? (fourPMinus.reduce((acc, d) => acc + d.weightInKarats, 0) /
         fourPMinus.reduce((acc, d) => acc + d.numberOfDiamonds, 0)).toFixed(3)
      : 0
  }), [fourPMinus]);
  
  // Client distribution data
  const clientDistributionMap = useMemo(() => 
    diamonds.reduce((acc, diamond) => {
      const client = clients.find(c => c.id === diamond.clientId)?.name || 'Unknown';
      if (!acc[client]) {
        acc[client] = 0;
      }
      acc[client] += diamond.totalValue;
      return acc;
    }, {} as Record<string, number>),
    [diamonds, clients]
  );
  
  const clientDistributionData = useMemo(() => 
    Object.entries(clientDistributionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)  // Only show top 5 clients
      .map(([name, value]) => ({
        name,
        value,
      })),
    [clientDistributionMap]
  );
  
  // Get selected client information
  const selectedClient = useMemo(() => 
    selectedClientId !== 'all' 
      ? clients.find(c => c.id === selectedClientId) 
      : null,
    [selectedClientId, clients]
  );
  
  // Client rates data based on selected client or average of all clients
  const clientRates = useMemo(() => 
    selectedClient 
      ? {
          fourPPlus: selectedClient.rates.fourPPlus,
          fourPMinus: selectedClient.rates.fourPMinus,
          differential: selectedClient.rates.fourPPlus - selectedClient.rates.fourPMinus
        }
      : {
          fourPPlus: clients.length ? clients.reduce((acc, c) => acc + c.rates.fourPPlus, 0) / clients.length : 0,
          fourPMinus: clients.length ? clients.reduce((acc, c) => acc + c.rates.fourPMinus, 0) / clients.length : 0,
          differential: clients.length ? clients.reduce((acc, c) => acc + (c.rates.fourPPlus - c.rates.fourPMinus), 0) / clients.length : 0
        },
    [selectedClient, clients]
  );
  
  // Calculate 30-day rate trend 
  const calculateRateTrend = (clientId, category) => {
    // Simulate rate history data (this would come from your backend in a real app)
    const simulateHistory = () => {
      const currentRate = category === '4P Plus' 
        ? clientId === 'all' 
          ? clientRates.fourPPlus 
          : selectedClient?.rates.fourPPlus || 0
        : clientId === 'all'
          ? clientRates.fourPMinus
          : selectedClient?.rates.fourPMinus || 0;
      
      // Create a slight trend with some randomness
      const data = [];
      const trendDirection = Math.random() > 0.5 ? 1 : -1;
      const trendStrength = Math.random() * 0.05; // 0-5% trend
      
      for (let i = 30; i >= 0; i--) {
        const daysFactor = i / 30; // Higher for older dates
        const randomness = 0.02; // 2% randomness
        const dayValue = currentRate * (
          1 + (trendDirection * trendStrength * daysFactor) + 
          (Math.random() * randomness - randomness/2)
        );
        
        data.push({
          date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
          value: Math.round(dayValue)
        });
      }
      
      return data;
    };
    
    const history = simulateHistory();
    
    // Calculate the trend percentage
    const oldestValue = history[0].value;
    const newestValue = history[history.length - 1].value;
    const percentChange = ((newestValue - oldestValue) / oldestValue) * 100;
    
    return {
      data: history,
      change: percentChange.toFixed(1),
      direction: percentChange >= 0 ? 'up' : 'down'
    };
  };
  
  // Past trend data based on timeframe and selected client
  const generateDateData = () => {
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const dayDiamonds = relevantDiamonds.filter(
        d => format(new Date(d.entryDate), 'yyyy-MM-dd') === dateString
      );
      
      const dayInvoices = relevantInvoices.filter(
        inv => format(new Date(inv.issueDate), 'yyyy-MM-dd') === dateString
      );
      
      const fourPPlusDiamonds = dayDiamonds.filter(d => d.category === '4P Plus');
      const fourPMinusDiamonds = dayDiamonds.filter(d => d.category === '4P Minus');
      
      data.push({
        date: format(date, isMobile ? 'dd/MM' : 'dd MMM'),
        count: dayDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
        value: dayDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000, // Show in thousands
        invoiced: dayInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0) / 1000, // Show in thousands
        '4P Plus Count': fourPPlusDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
        '4P Minus Count': fourPMinusDiamonds.reduce((acc, d) => acc + d.numberOfDiamonds, 0),
        '4P Plus Value': fourPPlusDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000,
        '4P Minus Value': fourPMinusDiamonds.reduce((acc, d) => acc + d.totalValue, 0) / 1000,
      });
    }
    return data.reverse();
  };
  
  const trendData = useMemo(() => generateDateData(), [relevantDiamonds, relevantInvoices, days]);
  
  // Adjust number of data points for mobile
  const getResponsiveTrendData = () => {
    if (isMobile) {
      return trendData.slice(-5); // Show only the last 5 data points on mobile
    } else if (isTablet) {
      return trendData.slice(-7); // Show the last 7 data points on tablet
    } else {
      return trendData; // Show all data points on desktop
    }
  };
  
  // Rate trends
  const fourPPlusTrend = useMemo(() => 
    calculateRateTrend(selectedClientId, '4P Plus'),
    [selectedClientId, clientRates.fourPPlus]
  );
  
  const fourPMinusTrend = useMemo(() => 
    calculateRateTrend(selectedClientId, '4P Minus'),
    [selectedClientId, clientRates.fourPMinus]
  );
  
  // Pie chart colors - adjust for dark mode
  const COLORS = isDarkMode 
    ? ['#6366f1', '#818cf8', '#4f46e5', '#a5b4fc', '#c7d2fe'] 
    : ['#4f46e5', '#818cf8', '#6366f1', '#a5b4fc', '#c7d2fe'];

  // Responsive chart heights
  const getChartHeight = (defaultHeight) => {
    if (isMobile) return defaultHeight * 0.8;
    if (isTablet) return defaultHeight * 0.9;
    return defaultHeight;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="container-responsive mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Section with Timeframe and Client Selector */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}
            >
              <Gem className="inline-block mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
              Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`mt-1 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {selectedClient ? `${selectedClient.name}'s Overview` : 'Business Analysis and Insights'}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className={`flex items-center gap-2 sm:gap-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-2 rounded-lg shadow-sm`}>
              <Filter className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className={`w-32 sm:w-36 border-none shadow-none focus:ring-0 h-8 sm:h-10 text-xs sm:text-sm py-0 ${isDarkMode ? 'bg-gray-800 text-gray-200' : ''}`}>
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="quarter">Past Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className={`flex items-center gap-2 sm:gap-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-2 rounded-lg shadow-sm`}>
              <Users className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className={`w-40 sm:w-48 border-none shadow-none focus:ring-0 h-8 sm:h-10 text-xs sm:text-sm py-0 ${isDarkMode ? 'bg-gray-800 text-gray-200' : ''}`}>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatCard 
              title="Total Diamonds"
              value={totalDiamonds.toLocaleString()}
              secondaryValue={`${totalWeight.toFixed(2)} carats`}
              description={`${recentTransactions.reduce((acc, d) => acc + d.numberOfDiamonds, 0)} in last ${days} days`}
              icon={<Diamond className="h-5 w-5 sm:h-6 sm:w-6" />}
              trend={{
                value: recentTransactions.reduce((acc, d) => acc + d.numberOfDiamonds, 0) > 0 
                  ? ((recentTransactions.reduce((acc, d) => acc + d.numberOfDiamonds, 0) / totalDiamonds) * 100).toFixed(1) 
                  : '0.0',
                isPositive: true,
                label: "vs. previous period"
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StatCard 
              title={selectedClient ? "Diamond Entries" : "Total Clients"}
              value={selectedClient ? fourPPlus.length + fourPMinus.length : clients.length}
              description={selectedClient ? "Inventory records" : "Active diamond traders"}
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
              onClick={selectedClient ? () => navigate(`/clients/${selectedClient.id}`) : null}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <StatCard 
              title="Total Value"
              value={`₹${totalValue.toLocaleString('en-IN')}`}
              description="Current valuation"
              icon={<Wallet className="h-5 w-5 sm:h-6 sm:w-6" />}
              trend={{
                value: recentValue > 0 
                  ? ((recentValue / totalValue) * 100).toFixed(1) 
                  : '0.0',
                isPositive: true,
                label: "growth rate"
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <StatCard 
              title={`${timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : 'Quarterly'} Activity`}
              value={`₹${recentValue.toLocaleString('en-IN')}`}
              description={`Last ${days} days activity`}
              icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6" />}
              trend={{
                value: recentInvoices.length > 0 
                  ? ((recentInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0) / recentValue) * 100).toFixed(1) 
                  : '0.0',
                isPositive: true,
                label: "invoiced"
              }}
            />
          </motion.div>
        </div>
        
        {/* Client Rate Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4 flex items-center`}>
            <Tag className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
            {selectedClient ? `${selectedClient.name}'s Diamond Rates` : 'Average Client Rates'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* 4P Plus Rate Card */}
            <ClientRateCard 
              title="4P Plus Rate"
              rate={clientRates.fourPPlus}
              description="Per carat rate"
              change={fourPPlusTrend.change}
              badgeText={getRateCategory(clientRates.fourPPlus)}
              badgeColor={getRateCategoryColor(clientRates.fourPPlus, isDarkMode)}
              icon={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fourPPlusTrend.data.slice(-10)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="plusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#6366f1" : "#4f46e5"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#6366f1" : "#4f46e5"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isDarkMode ? "#6366f1" : "#4f46e5"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#plusGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
              footer={
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-100 dark:border-gray-700 text-xs">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Market Avg: ₹{getMarketAverage(clients.map(c => c.rates), '4P Plus').toLocaleString('en-IN')}
                  </span>
                  <span className={getComparisonClass(
                    clientRates.fourPPlus, 
                    getMarketAverage(clients.map(c => c.rates), '4P Plus'),
                    isDarkMode
                  )}>
                    {getComparisonText(
                      clientRates.fourPPlus, 
                      getMarketAverage(clients.map(c => c.rates), '4P Plus')
                    )}
                  </span>
                </div>
              }
            />
            
            {/* 4P Minus Rate Card */}
            <ClientRateCard 
              title="4P Minus Rate"
              rate={clientRates.fourPMinus}
              description="Per piece rate"
              change={fourPMinusTrend.change}
              badgeText={getRateCategory(clientRates.fourPMinus)}
              badgeColor={getRateCategoryColor(clientRates.fourPMinus, isDarkMode)}
              icon={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fourPMinusTrend.data.slice(-10)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="minusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#a5b4fc" : "#818cf8"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#a5b4fc" : "#818cf8"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isDarkMode ? "#a5b4fc" : "#818cf8"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#minusGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
              footer={
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-100 dark:border-gray-700 text-xs">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Market Avg: ₹{getMarketAverage(clients.map(c => c.rates), '4P Minus').toLocaleString('en-IN')}
                  </span>
                  <span className={getComparisonClass(
                    clientRates.fourPMinus, 
                    getMarketAverage(clients.map(c => c.rates), '4P Minus'),
                    isDarkMode
                  )}>
                    {getComparisonText(
                      clientRates.fourPMinus, 
                      getMarketAverage(clients.map(c => c.rates), '4P Minus')
                    )}
                  </span>
                </div>
              }
            />
            
            {/* Rate Differential Card */}
            <ClientRateCard 
              title="Rate Differential"
              rate={clientRates.differential}
              description="Plus/Minus spread"
              icon={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fourPPlusTrend.data.slice(-10)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#8b5cf6" : "#6366f1"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#8b5cf6" : "#6366f1"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isDarkMode ? "#8b5cf6" : "#6366f1"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#diffGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
              footer={
                <div className="flex justify-between items-center mt-1 pt-1 text-xs border-t border-indigo-100 dark:border-gray-700">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Pricing Strategy
                  </span>
                  <Badge variant="outline" className={
                    clientRates.differential > 5000 
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" 
                      : clientRates.differential > 2000 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }>
                    {clientRates.differential > 5000 
                      ? "High Spread" 
                      : clientRates.differential > 2000 
                        ? "Medium Spread"
                        : "Low Spread"}
                  </Badge>
                </div>
              }
            />
          </div>
        </motion.div>
        
        {/* 4P Category Analysis Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4 flex items-center`}>
            <Gem className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
            4P Category Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* 4P Plus Card */}
            <CategoryCard
              title="4P Plus Insights"
              icon={<Gem className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`} />}
              isDarkMode={isDarkMode}
              metrics={[
                { label: "Total Count", value: fourPPlusStats.count.toLocaleString() },
                { label: "Total Weight", value: `${fourPPlusStats.weight} ct` },
                { label: "Avg Weight/Diamond", value: `${fourPPlusStats.avgWeightPerDiamond} ct` },
                { label: "Avg Price/Carat", value: `₹${Number(fourPPlusStats.avgPricePerCarat).toLocaleString('en-IN')}` }
              ]}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={getResponsiveTrendData().slice(-4)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#eee"} />
                    <XAxis dataKey="date" tick={{fontSize: isMobile ? 9 : 11, fill: isDarkMode ? "#9ca3af" : "#374151"}} />
                    <YAxis tick={{fontSize: isMobile ? 9 : 11, fill: isDarkMode ? "#9ca3af" : "#374151"}} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px', 
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        borderColor: isDarkMode ? '#374151' : '#dddddd',
                        color: isDarkMode ? '#e5e7eb' : '#111827'
                      }} 
                      itemStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      labelStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                    />
                    <Bar dataKey="4P Plus Count" name="Count" fill={isDarkMode ? "#6366f1" : "#4f46e5"} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="4P Plus Value" name="Value (₹k)" fill={isDarkMode ? "#818cf8" : "#818cf8"} radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              }
            />
            
            {/* 4P Minus Card */}
            <CategoryCard
              title="4P Minus Insights"
              icon={<Gem className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />}
              isDarkMode={isDarkMode}
              metrics={[
                { label: "Total Count", value: fourPMinusStats.count.toLocaleString() },
                { label: "Total Weight", value: `${fourPMinusStats.weight} ct` },
                { label: "Avg Weight/Diamond", value: `${fourPMinusStats.avgWeightPerDiamond} ct` },
                { label: "Avg Price/Carat", value: `₹${Number(fourPMinusStats.avgPricePerCarat).toLocaleString('en-IN')}` }
              ]}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={getResponsiveTrendData().slice(-4)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#eee"} />
                    <XAxis dataKey="date" tick={{fontSize: isMobile ? 9 : 11, fill: isDarkMode ? "#9ca3af" : "#374151"}} />
                    <YAxis tick={{fontSize: isMobile ? 9 : 11, fill: isDarkMode ? "#9ca3af" : "#374151"}} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        borderColor: isDarkMode ? '#374151' : '#dddddd',
                        color: isDarkMode ? '#e5e7eb' : '#111827'
                      }}
                      itemStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      labelStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                    />
                    <Bar dataKey="4P Minus Count" name="Count" fill={isDarkMode ? "#a5b4fc" : "#818cf8"} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="4P Minus Value" name="Value (₹k)" fill={isDarkMode ? "#c7d2fe" : "#a5b4fc"} radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              }
            />
          </div>
        </motion.div>
        
        {/* Summary Metrics Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4 font-medium bg-white dark:bg-gray-800 border dark:border-gray-700 shadow p-3 sm:p-4 rounded-lg">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 sm:p-3 rounded-md text-center transform hover:scale-105 transition-transform">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Pieces</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{totalDiamonds}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 rounded-md text-center transform hover:scale-105 transition-transform">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Weight</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{totalWeight.toFixed(2)} <span className="text-xs">ct</span></p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 sm:p-3 rounded-md text-center transform hover:scale-105 transition-transform">
  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Value</p>
  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
</div>
</div>
</motion.div>

{/* Market Analysis Charts Section */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.8 }}
  className="mb-6 sm:mb-8"
>
  <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4 flex items-center`}>
    <LineChart className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
    Comprehensive Analysis
  </h2>
  <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-3 sm:p-4 rounded-lg shadow-md`}>
    <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
      <TabsList className={`mb-4 sm:mb-6 w-full flex flex-wrap justify-start gap-2 ${isDarkMode ? 'bg-gray-900/50' : 'bg-indigo-50'} p-1 rounded-lg overflow-x-auto`}>
        <TabsTrigger value="inventory" className={`data-[state=active]:${isDarkMode ? 'bg-indigo-800' : 'bg-indigo-600'} data-[state=active]:text-white text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
          <BarChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Inventory Analysis
        </TabsTrigger>
        <TabsTrigger value="comparison" className={`data-[state=active]:${isDarkMode ? 'bg-indigo-800' : 'bg-indigo-600'} data-[state=active]:text-white text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
          <PieChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Category Comparison
        </TabsTrigger>
        {selectedClientId === 'all' && (
          <TabsTrigger value="clients" className={`data-[state=active]:${isDarkMode ? 'bg-indigo-800' : 'bg-indigo-600'} data-[state=active]:text-white text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Client Comparison
          </TabsTrigger>
        )}
      </TabsList>
      
      {/* Inventory Analysis Tab */}
      <TabsContent value="inventory" className="mt-0">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart 
              data={getResponsiveTrendData()} 
              margin={{ 
                top: 5, 
                right: isMobile ? 10 : 30, 
                left: isMobile ? 10 : 20, 
                bottom: 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#9ca3af" : "#374151"}} 
                interval={isMobile ? 1 : 0}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke={isDarkMode ? "#6366f1" : "#4f46e5"} 
                tick={{fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#9ca3af" : "#374151"}}
                width={isMobile ? 30 : 40}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke={isDarkMode ? "#a5b4fc" : "#818cf8"} 
                tick={{fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#9ca3af" : "#374151"}}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: 'none',
                  fontSize: isMobile ? '11px' : '12px',
                  backgroundColor: isDarkMode ? '#1f2937' : 'white',
                  borderColor: isDarkMode ? '#374151' : '#dddddd',
                  color: isDarkMode ? '#e5e7eb' : '#111827'
                }}
                itemStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                labelStyle={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
              />
              <Legend 
                iconType="circle" 
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={{
                  fontSize: isMobile ? '10px' : '12px',
                  color: isDarkMode ? '#e5e7eb' : '#111827'
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="4P Plus Count" 
                name="4P Plus Count" 
                fill={isDarkMode ? "#6366f1" : "#4f46e5"} 
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 20 : 30}
              />
              <Bar 
                yAxisId="left" 
                dataKey="4P Minus Count" 
                name="4P Minus Count" 
                fill={isDarkMode ? "#a5b4fc" : "#818cf8"} 
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 20 : 30}
              />
              <Bar 
                yAxisId="right" 
                dataKey="4P Plus Value" 
                name="4P Plus Value (₹k)" 
                fill={isDarkMode ? "#818cf8" : "#6366f1"} 
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 20 : 30}
              />
              <Bar 
                yAxisId="right" 
                dataKey="4P Minus Value" 
                name="4P Minus Value (₹k)" 
                fill={isDarkMode ? "#c7d2fe" : "#a5b4fc"} 
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 20 : 30}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      
      {/* Category Comparison Tab */}
      {/* Enhanced Comparison Tab with improved pie charts */}
      <TabsContent value="comparison" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Enhanced Diamond Count Distribution */}
          <AnalysisCard
            title="Diamond Count Distribution"
            icon={<PieChart className="h-3 w-3 sm:h-4 sm:w-4" />}
            isDarkMode={isDarkMode}
          >
            <div className="h-36 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 50 : 70}
                    innerRadius={isMobile ? 25 : 40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    cornerRadius={4}
                    activeIndex={activeChartIndices.countChart}
                    onMouseEnter={(_, index) => 
                      setActiveChartIndices({...activeChartIndices, countChart: index})
                    }
                    activeShape={(props) => renderActiveShape(props, 'Count')}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={isDarkMode ? "#1f1f1f" : "#ffffff"}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={
                      <CustomTooltip 
                                isDarkMode={isDarkMode}
                                isMobile={isMobile}
                                valueType="Count"
                                formatter={(value) => `${value}`} active={undefined} payload={undefined}                      />
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </AnalysisCard>
          
          {/* Enhanced Diamond Weight Distribution */}
          <AnalysisCard
            title="Diamond Weight Distribution"
            icon={<PieChart className="h-3 w-3 sm:h-4 sm:w-4" />}
            isDarkMode={isDarkMode}
          >
            <div className="h-36 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={weightDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 50 : 70}
                    innerRadius={isMobile ? 25 : 40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    cornerRadius={4}
                    activeIndex={activeChartIndices.weightChart}
                    onMouseEnter={(_, index) => 
                      setActiveChartIndices({...activeChartIndices, weightChart: index})
                    }
                    activeShape={(props) => renderActiveShape(props, 'Weight')}
                  >
                    {weightDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={isDarkMode ? "#1f1f1f" : "#ffffff"}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={
                      <CustomTooltip 
                                isDarkMode={isDarkMode}
                                isMobile={isMobile}
                                valueType="Weight"
                                formatter={(value) => `${typeof value === 'number' ? value.toFixed(2) : value} carats`} active={undefined} payload={undefined}                      />
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </AnalysisCard>
          
          {/* Enhanced Diamond Value Distribution */}
          <AnalysisCard
            title="Diamond Value Distribution"
            icon={<PieChart className="h-3 w-3 sm:h-4 sm:w-4" />}
            isDarkMode={isDarkMode}
          >
            <div className="h-36 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={valueDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 50 : 70}
                    innerRadius={isMobile ? 25 : 40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    cornerRadius={4}
                    activeIndex={activeChartIndices.valueChart}
                    onMouseEnter={(_, index) => 
                      setActiveChartIndices({...activeChartIndices, valueChart: index})
                    }
                    activeShape={(props) => renderActiveShape(props, 'Value')}
                  >
                    {valueDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={isDarkMode ? "#1f1f1f" : "#ffffff"}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={
                      <CustomTooltip 
                        isDarkMode={isDarkMode}
                        isMobile={isMobile}
                        valueType="Value"
                        formatter={(value) => `₹${typeof value === 'number' ? value.toLocaleString('en-IN') : value}`}
                        active={undefined}
                        payload={undefined}
                      />
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </AnalysisCard>
        </div>
      </TabsContent>
      
      {/* Client Comparison Tab - Only shown when viewing all clients */}
      {selectedClientId === 'all' && (
        <TabsContent value="clients" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Enhanced Client Value Distribution - Fixed TypeScript Errors */}
<AnalysisCard
  title="Client Value Distribution"
  icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}
  isDarkMode={isDarkMode}
>
  <div className="h-64 sm:h-80" aria-label="Client value distribution pie chart" role="img">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={clientDistributionData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={isMobile ? 70 : 100}
          innerRadius={isMobile ? 40 : 60}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
          cornerRadius={4}
          activeIndex={activeClientChartIndex}
          onMouseEnter={(_, index) => setActiveClientChartIndex(index)}
          onClick={(data) => handleClientSelect(data.id || data.name)}
          activeShape={(props) => renderClientActiveShape(props, isMobile)}
        >
          {clientDistributionData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke={isDarkMode ? "#1f1f1f" : "#ffffff"}
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip 
          content={
            <ClientTooltip 
                                  isDarkMode={isDarkMode}
                                  isMobile={isMobile} active={undefined} payload={undefined}            />
          }
        />
        <Legend 
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconSize={8}
          iconType="circle"
          formatter={(value, entry, index) => {
            // Truncate long client names
            const displayName = value.length > (isMobile ? 8 : 12) 
              ? `${value.substring(0, isMobile ? 8 : 12)}...` 
              : value;
            
            return (
              <span 
                className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"} cursor-pointer`}
                onClick={() => setActiveClientChartIndex(index)}
              >
                {displayName}
              </span>
            );
          }}
          wrapperStyle={{ 
            paddingTop: isMobile ? 10 : 16,
            fontSize: isMobile ? 10 : 12
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  </div>
</AnalysisCard>
            
            {/* Enhanced Top Clients by Value Bar Chart */}
            {/* Enhanced Top Clients by Value Bar Chart - Fixed Radius TypeScript Error */}
<AnalysisCard
  title="Top Clients by Value"
  icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}
  isDarkMode={isDarkMode}
>
  <div className="h-64 sm:h-80" aria-label="Top clients by value bar chart" role="img">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        layout="vertical"
        data={clientDistributionData}
        margin={{
          top: 5,
          right: isMobile ? 10 : 30,
          left: isMobile ? 50 : 80,
          bottom: 5,
        }}
        barGap={4}
        barCategoryGap={8}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          horizontal={!isMobile} 
          stroke={isDarkMode ? "#374151" : "#f0f0f0"} 
        />
        <XAxis 
          type="number" 
          tick={{fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#9ca3af" : "#374151"}}
          tickFormatter={(value) => value >= 1000000 
            ? `₹${(value / 1000000).toFixed(1)}M` 
            : `₹${(value / 1000).toFixed(0)}K`}
          axisLine={{ stroke: isDarkMode ? "#374151" : "#f0f0f0" }}
          tickLine={{ stroke: isDarkMode ? "#374151" : "#f0f0f0" }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#9ca3af" : "#374151"}}
          width={isMobile ? 50 : 80}
          tickFormatter={(value) => 
            value.length > (isMobile ? 7 : 12)
              ? `${value.substring(0, isMobile ? 7 : 12)}...`
              : value
          }
          axisLine={{ stroke: isDarkMode ? "#374151" : "#f0f0f0" }}
          tickLine={{ stroke: isDarkMode ? "#374151" : "#f0f0f0" }}
        />
        <Tooltip 
          content={<ClientBarTooltip isDarkMode={isDarkMode} isMobile={isMobile} active={undefined} payload={undefined} />}
          cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        />
        <Bar 
          dataKey="value" 
          name="Value"
          fill={isDarkMode ? "#6366f1" : "#4f46e5"} 
          radius={4}  // Fixed: Using a single number instead of array
          onClick={(data) => handleClientSelect(data.id || data.name)}
          cursor="pointer"
          label={isMobile ? null : {
            position: 'right',
            formatter: (value) => value >= 1000000 
              ? `₹${(value / 1000000).toFixed(1)}M` 
              : `₹${(value / 1000).toFixed(0)}K`,
            fill: isDarkMode ? "#9ca3af" : "#374151",
            fontSize: 11
          }}
        >
          {clientDistributionData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
</AnalysisCard>
          </div>
        </TabsContent>
      )}
    </Tabs>
  </div>
</motion.div>

{/* Client Information - Only shown when a specific client is selected */}
{selectedClient && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.9 }}
    className="mb-6 sm:mb-8"
  >
    <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4 flex items-center`}>
      <Users className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
      Client Information
    </h2>
    <Card className={`border-0 shadow-md overflow-hidden ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-700' : ''}`}>
      <CardHeader className={`pb-2 sm:pb-3 border-b ${isDarkMode ? 'bg-indigo-900/20 border-gray-700' : 'bg-indigo-50'} px-4 sm:px-6 py-3 sm:py-4`}>
        <CardTitle className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
          <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'} flex items-center justify-center mr-2`}>
            <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`} />
          </div>
          {selectedClient.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-5 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Contact Information</h3>
            <div className={`space-y-1 sm:space-y-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
              <p><span className="font-medium">Contact Person:</span> {selectedClient.contactPerson}</p>
              <p><span className="font-medium">Company:</span> {selectedClient.company}</p>
              <p><span className="font-medium">Phone:</span> {selectedClient.phone || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {selectedClient.email || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Business Terms</h3>
            <div className={`space-y-1 sm:space-y-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
              <p><span className="font-medium">4P Plus Rate:</span> ₹{selectedClient.rates.fourPPlus.toLocaleString('en-IN')} per carat</p>
              <p><span className="font-medium">4P Minus Rate:</span> ₹{selectedClient.rates.fourPMinus.toLocaleString('en-IN')} per piece</p>
              <p><span className="font-medium">Payment Terms:</span> {selectedClient.paymentTerms || 'N/A'}</p>
              {selectedClient.notes && (
                <p><span className="font-medium">Notes:</span> {selectedClient.notes}</p>
              )}
            </div>
          </div>
        </div>
        
        <Separator className={`my-4 sm:my-6 ${isDarkMode ? 'bg-gray-700' : ''}`} />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg`}>
            <h4 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Business</h4>
            <p className={`text-lg sm:text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>₹{totalValue.toLocaleString('en-IN')}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{totalDiamonds.toLocaleString()} diamonds</p>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg`}>
            <h4 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Invoices</h4>
            <p className={`text-lg sm:text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>{relevantInvoices.length}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              ₹{relevantInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0).toLocaleString('en-IN')} total value
            </p>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg`}>
            <h4 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Status</h4>
            <p className={`text-lg sm:text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : ''}`}>
              {relevantInvoices.filter(inv => inv.status === 'paid').length} / {relevantInvoices.length} Paid
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              ₹{relevantInvoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.totalAmount, 0).toLocaleString('en-IN')} received
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6">
          <Button 
            variant="outline" 
            className={`flex items-center text-xs sm:text-sm h-8 sm:h-10 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : ''}`} 
            onClick={() => navigate(`/clients/${selectedClient.id}`)}
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Update Client Rates
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)}

{/* Client Rates Note - Only show when viewing all clients */}
{selectedClientId === 'all' && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 1.0 }}
    className="mb-6 sm:mb-8"
  >
    <Card className={`border ${isDarkMode ? 'border-amber-700 bg-amber-900/20 text-amber-200' : 'border-amber-200 bg-amber-50'}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start">
          <div className="mr-3 sm:mr-4 mt-1">
            <Tag className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Client-Specific Rates</h3>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-700'} mt-1`}>
              Note that each client has their own individual rates for 4P Plus and 4P Minus diamonds.
              The rates shown in this dashboard are averages calculated across all clients when "All Clients" is selected.
              To view or update a specific client's rates, select them from the client dropdown or visit the Clients section.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)}
      </div>
    </div>
  );
};

export default Dashboard;

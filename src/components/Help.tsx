import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, CheckCircle, FileText, HelpCircle, Mail, MessageCircle, Phone, Search, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Help = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [supportCategory, setSupportCategory] = useState('technical');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  
  // Sample FAQ data
  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      items: [
        {
          question: 'What is DBMS?',
          answer: 'DBMS (Diamond Business Management System) is a comprehensive solution designed specifically for diamond merchants and traders to manage inventory, client relationships, invoicing, and analytics in one platform.'
        },
        {
          question: 'How do I get started with DBMS?',
          answer: 'To get started, log in with your credentials and navigate to the Dashboard. From there, you can access all features including Diamond Entry, Clients, Invoices, and Analytics. For a guided tour, click on the "Take Tour" button in the Dashboard.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, DBMS employs industry-standard encryption and security practices to protect your data. We use secure connections (HTTPS) and regularly back up all information. For added security, enable two-factor authentication in your Settings.'
        }
      ]
    },
    {
      id: 'diamonds',
      title: 'Diamond Management',
      items: [
        {
          question: 'How do I add a new diamond to inventory?',
          answer: 'To add a new diamond, navigate to the Diamonds section and click the "Add New Diamond" button. Fill in the details including carat, cut, color, clarity, and other specifications. You can also upload images and certificates.'
        },
        {
          question: 'How do I track diamond history?',
          answer: 'Each diamond entry has a History tab that shows all changes, transfers, and price adjustments. The system automatically logs these changes with timestamps and user information.'
        },
        {
          question: 'Can I import diamond data from other systems?',
          answer: 'Yes, DBMS supports importing data from CSV, Excel, and JSON formats. Go to Settings > Data > Import Data to upload your files. The system will guide you through mapping fields to ensure proper data integration.'
        }
      ]
    },
    {
      id: 'clients',
      title: 'Client Management',
      items: [
        {
          question: 'How do I add a new client?',
          answer: 'Navigate to the Clients section and click "Add New Client." Fill in the contact information, preferences, and any notes. You can categorize clients by type (retailer, wholesaler, etc.) and assign them to specific team members.'
        },
        {
          question: 'Can I track client purchasing history?',
          answer: 'Yes, each client profile includes a comprehensive purchase history, showing all transactions, inquiries, and communications. This helps you understand their preferences and provide personalized service.'
        }
      ]
    },
    {
      id: 'invoices',
      title: 'Invoicing & Payments',
      items: [
        {
          question: 'How do I create a new invoice?',
          answer: 'Go to the Invoices section and click "Create Invoice." Select a client, add diamond items from inventory, specify payment terms, and generate the invoice. You can preview it before sending and choose to email it directly or download as PDF.'
        },
        {
          question: 'How do I track payment status?',
          answer: 'The Invoices dashboard shows payment status for all invoices. You can filter by status (paid, pending, overdue) and get notifications when payments are received or when invoices become overdue.'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      items: [
        {
          question: 'What types of reports can I generate?',
          answer: 'DBMS offers various reports including sales analysis, inventory valuation, client profitability, market trend analysis, and cash flow reports. Reports can be customized by date range and exported in multiple formats.'
        },
        {
          question: 'How current is the market data?',
          answer: 'Market data is updated daily for major diamond indices. Price trends, demand patterns, and benchmark comparisons are refreshed to ensure you have the most current information for decision-making.'
        }
      ]
    }
  ];
  
  // Sample guide topics
  const guideTopics = [
    {
      id: 'getting-started',
      title: 'Getting Started with DBMS',
      description: 'Learn the basics of navigating and using the system',
      icon: <BookOpen className="h-5 w-5" />,
      duration: '15 min'
    },
    {
      id: 'diamond-inventory',
      title: 'Managing Diamond Inventory',
      description: 'Best practices for diamond entry and tracking',
      icon: <FileText className="h-5 w-5" />,
      duration: '20 min'
    },
    {
      id: 'client-relationships',
      title: 'Client Relationship Management',
      description: 'How to maintain and improve client relationships',
      icon: <MessageCircle className="h-5 w-5" />,
      duration: '18 min'
    },
    {
      id: 'invoicing',
      title: 'Efficient Invoicing Workflows',
      description: 'Create, send, and manage invoices effectively',
      icon: <FileText className="h-5 w-5" />,
      duration: '12 min'
    },
    {
      id: 'analytics',
      title: 'Using Analytics Dashboard',
      description: 'Interpret data and make informed decisions',
      icon: <CheckCircle className="h-5 w-5" />,
      duration: '25 min'
    },
    {
      id: 'mobile-app',
      title: 'Using DBMS on Mobile',
      description: 'Access your data on the go with our mobile app',
      icon: <Video className="h-5 w-5" />,
      duration: '10 min'
    }
  ];
  
  // Sample video tutorials
  const videoTutorials = [
    {
      id: 'intro',
      title: 'Introduction to DBMS',
      description: 'Overview of all features and capabilities',
      thumbnail: '/api/placeholder/320/180',
      duration: '5:32'
    },
    {
      id: 'diamond-entry',
      title: 'Adding and Managing Diamonds',
      description: 'Step-by-step guide to diamond inventory management',
      thumbnail: '/api/placeholder/320/180',
      duration: '8:45'
    },
    {
      id: 'client-management',
      title: 'Client Management Mastery',
      description: 'Learn advanced client relationship techniques',
      thumbnail: '/api/placeholder/320/180',
      duration: '7:18'
    },
    {
      id: 'invoicing',
      title: 'Creating Professional Invoices',
      description: 'Generate, customize, and send invoices',
      thumbnail: '/api/placeholder/320/180',
      duration: '6:24'
    },
    {
      id: 'reports',
      title: 'Generating Insightful Reports',
      description: 'Make the most of your business data',
      thumbnail: '/api/placeholder/320/180',
      duration: '9:51'
    },
    {
      id: 'settings',
      title: 'Configuring Your Account',
      description: 'Security, preferences, and user management',
      thumbnail: '/api/placeholder/320/180',
      duration: '4:16'
    }
  ];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the support request
    toast({
      title: "Support Request Submitted",
      description: "We've received your message and will respond shortly.",
      variant: "default",
    });
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };
  
  // Filter FAQs based on search query
  const filteredFAQs = searchQuery 
    ? faqCategories.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : faqCategories;
      
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers, tutorials, and support resources</p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for help topics, tutorials, and FAQs..." 
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2" 
              onClick={() => setSearchQuery('')}
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        
        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions about using DBMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <h3 className="font-medium text-lg">{category.title}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No results found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try searching with different keywords or browse the categories
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Guides Tab */}
        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>User Guides & Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides to help you make the most of DBMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guideTopics.map((guide) => (
                  <Card key={guide.id} className="border hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <div className="bg-primary/10 p-2 rounded-md">
                          {guide.icon}
                        </div>
                        <Badge variant="outline">{guide.duration}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{guide.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 pb-4">
                      <Button variant="ghost" className="p-0 h-auto text-primary">
                        Read guide
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Video Tutorials Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Learn visually with our step-by-step video guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoTutorials.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="mt-3 font-medium">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact Support Tab */}
        <TabsContent value="contact">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Need personalized help? Our support team is ready to assist you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={contactForm.name} 
                          onChange={handleContactFormChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={contactForm.email} 
                          onChange={handleContactFormChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        value={contactForm.subject} 
                        onChange={handleContactFormChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="category">Support Category</Label>
                      </div>
                      <Select 
                        value={supportCategory} 
                        onValueChange={setSupportCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="account">Account & Billing</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="priority">Priority</Label>
                      </div>
                      <Select 
                        value={contactForm.priority}
                        onValueChange={(value) => setContactForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="medium">Medium - Need assistance</SelectItem>
                          <SelectItem value="high">High - System issue</SelectItem>
                          <SelectItem value="urgent">Urgent - Business critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={5} 
                        value={contactForm.message} 
                        onChange={handleContactFormChange}
                        placeholder="Please describe your issue or question in detail..."
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button type="submit" className="w-full">Submit Support Request</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Support Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>support@dbms.example.com</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Support Hours</h3>
                    <div>
                      <p className="text-sm">Monday - Friday:</p>
                      <p className="font-medium">9:00 AM - 6:00 PM EST</p>
                    </div>
                    <div>
                      <p className="text-sm">Saturday:</p>
                      <p className="font-medium">10:00 AM - 2:00 PM EST</p>
                    </div>
                    <div>
                      <p className="text-sm">Sunday:</p>
                      <p className="font-medium">Closed</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Support Team</h3>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Jenna Davis</p>
                        <p className="text-xs text-muted-foreground">Technical Support Lead</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Michael Patel</p>
                        <p className="text-xs text-muted-foreground">Customer Success Manager</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => window.open('#')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Available during support hours
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
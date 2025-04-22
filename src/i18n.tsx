import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const enTranslations = {
  common: {
    loading: 'Loading...',
    notFound: 'Page not found',
    settings: 'Settings',
    help: 'Help',
    dashboard: 'Dashboard',
    clients: 'Clients',
    diamonds: 'Diamonds',
    invoices: 'Invoices',
    analytics: 'Analytics',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    welcomeBack: 'Welcome back'
  },
  login: {
    enterCredentials: 'Enter your credentials to login',
    successMessage: 'You have successfully logged in',
    forgotPassword: 'Forgot Password?',
    genericError: 'An error occurred during login',
    failed: 'Login Failed',
    checkCredentials: 'Please check your credentials and try again'
  },
  dashboard: {
    totalClients: 'Total Clients',
    totalDiamonds: 'Total Diamonds',
    pendingInvoices: 'Pending Invoices',
    recentActivity: 'Recent Activity',
    viewAll: 'View All'
  },
  diamonds: {
    addNew: 'Add New Diamond',
    entryDate: 'Entry Date',
    client: 'Client',
    kapanId: 'Kapan ID',
    numberOfDiamonds: 'Number of Diamonds',
    weight: 'Weight (Karats)',
    marketRate: 'Market Rate',
    category: 'Category',
    totalValue: 'Total Value',
    rawDamageWeight: 'Raw Damage Weight'
  },
  clients: {
    addNew: 'Add New Client',
    name: 'Name',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',
    company: 'Company',
    location: 'Location',
    fourPPlusRate: '4P+ Rate',
    fourPMinusRate: '4P- Rate',
    paymentTerms: 'Payment Terms',
    notes: 'Notes'
  },
  invoices: {
    new: 'New Invoice',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    client: 'Client',
    diamonds: 'Diamonds',
    totalAmount: 'Total Amount',
    status: 'Status',
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    paymentDate: 'Payment Date',
    notes: 'Notes'
  },
  settings: {
    profile: 'Profile',
    company: 'Company',
    system: 'System',
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme'
  }
};

// Gujarati translations
const guTranslations = {
  common: {
    loading: 'લોડ થઈ રહ્યું છે...',
    notFound: 'પેજ મળ્યું નથી',
    settings: 'સેટિંગ્સ',
    help: 'મદદ',
    dashboard: 'ડેશબોર્ડ',
    clients: 'ગ્રાહકો',
    diamonds: 'હીરા',
    invoices: 'ઇનવૉઇસ',
    analytics: 'એનાલિટિક્સ',
    login: 'લૉગિન',
    logout: 'લૉગઆઉટ',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    edit: 'સુધારો',
    delete: 'કાઢી નાખો',
    view: 'જુઓ',
    language: 'ભાષા',
    theme: 'થીમ',
    dark: 'ડાર્ક',
    light: 'લાઇટ',
    system: 'સિસ્ટમ',
    welcomeBack: 'પાછા આવ્યા સ્વાગત છે'
  },
  login: {
    enterCredentials: 'લૉગિન કરવા માટે તમારા ક્રેડેન્શિયલ્સ દાખલ કરો',
    successMessage: 'તમે સફળતાપૂર્વક લૉગિન કર્યું છે',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    genericError: 'લૉગિન દરમિયાન એક ભૂલ આવી',
    failed: 'લૉગિન નિષ્ફળ',
    checkCredentials: 'કૃપા કરીને તમારા ક્રેડેન્શિયલ્સ તપાસો અને ફરી પ્રયાસ કરો'
  },
  dashboard: {
    totalClients: 'કુલ ગ્રાહકો',
    totalDiamonds: 'કુલ હીરા',
    pendingInvoices: 'બાકી ઇનવૉઇસ',
    recentActivity: 'તાજેતરની પ્રવૃત્તિ',
    viewAll: 'બધા જુઓ'
  },
  diamonds: {
    addNew: 'નવો હીરો ઉમેરો',
    entryDate: 'એન્ટ્રી તારીખ',
    client: 'ગ્રાહક',
    kapanId: 'કાપન ID',
    numberOfDiamonds: 'હીરાની સંખ્યા',
    weight: 'વજન (કેરેટ)',
    marketRate: 'બજાર દર',
    category: 'કેટેગરી',
    totalValue: 'કુલ મૂલ્ય',
    rawDamageWeight: 'કાચા નુકસાનનું વજન'
  },
  clients: {
    addNew: 'નવો ગ્રાહક ઉમેરો',
    name: 'નામ',
    contactPerson: 'સંપર્ક વ્યક્તિ',
    phone: 'ફોન',
    email: 'ઇમેઇલ',
    company: 'કંપની',
    location: 'સ્થાન',
    fourPPlusRate: '4P+ દર',
    fourPMinusRate: '4P- દર',
    paymentTerms: 'ચુકવણીની શરતો',
    notes: 'નોંધ'
  },
  invoices: {
    new: 'નવું ઇનવૉઇસ',
    invoiceNumber: 'ઇનવૉઇસ નંબર',
    issueDate: 'જારી તારીખ',
    dueDate: 'નિયત તારીખ',
    client: 'ગ્રાહક',
    diamonds: 'હીરા',
    totalAmount: 'કુલ રકમ',
    status: 'સ્થિતિ',
    draft: 'ડ્રાફ્ટ',
    sent: 'મોકલેલ',
    paid: 'ચૂકવેલ',
    overdue: 'મુદત વીતી ગઈ છે',
    cancelled: 'રદ થયેલ',
    paymentDate: 'ચુકવણી તારીખ',
    notes: 'નોંધ'
  },
  settings: {
    profile: 'પ્રોફાઇલ',
    company: 'કંપની',
    system: 'સિસ્ટમ',
    notifications: 'નોટિફિકેશન',
    language: 'ભાષા',
    theme: 'થીમ'
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
      gu: guTranslations
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language'
    }
  });

export default i18n;
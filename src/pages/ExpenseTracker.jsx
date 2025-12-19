import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download, 
  Mail, 
  Plus, 
  Trash2, 
  Edit, 
  Filter, 
  X, 
  Check,
  BarChart3,
  PieChart,
  Calendar,
  ChevronDown,
  Send,
  FileText,
  Database,
  Smartphone,
  CreditCard,
  Home,
  ShoppingBag,
  Car,
  Utensils,
  Coffee,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Moon,
  Sun,
  Upload,
  Bell,
  User
} from 'lucide-react';

const ExpenseTracker = () => {
  // State for expenses - Start empty
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('expense-tracker-data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('expense-tracker-theme');
    return savedTheme || 'light';
  });
  
  // Onboarding tutorial state
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem('has-seen-tutorial');
    return hasSeenTutorial !== 'true' && expenses.length === 0;
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    description: ''
  });
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  
  // Email form
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    subject: 'Expense Report',
    message: 'Please find my expense report attached.'
  });
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Calculate totals
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const totalExpenses = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (expense.type === 'expense') {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount || 0);
    }
    return acc;
  }, {});
  
  // Monthly data
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = expense.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }
    if (expense.type === 'income') {
      acc[month].income += parseFloat(expense.amount || 0);
    } else {
      acc[month].expenses += parseFloat(expense.amount || 0);
    }
    return acc;
  }, {});
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (activeFilter !== 'all' && expense.type !== activeFilter) return false;
    
    if (timeFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      const timeDiff = now - expenseDate;
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      switch (timeFilter) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'quarter': return daysDiff <= 90;
        default: return true;
      }
    }
    
    return true;
  });
  
  // Categories for selection
  const categories = [
    { id: 'Food', name: 'Food', icon: <Utensils size={16} />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { id: 'Transport', name: 'Transport', icon: <Car size={16} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'Utilities', name: 'Utilities', icon: <Home size={16} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'Entertainment', name: 'Entertainment', icon: <Coffee size={16} />, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'Shopping', name: 'Shopping', icon: <ShoppingBag size={16} />, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { id: 'Healthcare', name: 'Healthcare', icon: <Heart size={16} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'Education', name: 'Education', icon: <FileText size={16} />, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'Salary', name: 'Salary', icon: <Wallet size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'Freelance', name: 'Freelance', icon: <Smartphone size={16} />, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { id: 'Other', name: 'Other', icon: <CreditCard size={16} />, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
  ];
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to ExpenseTracker Pro!",
      description: "Let's get started with 3 simple steps to master your finances.",
      icon: <Wallet className="text-blue-500" size={32} />,
      buttonText: "Next: Add Transactions",
      stepNumber: 1,
      totalSteps: 3
    },
    {
      title: "Add & Manage Transactions",
      description: "Track your income and expenses. Add transactions, categorize them, and keep everything organized.",
      icon: <Plus className="text-green-500" size={32} />,
      buttonText: "Next: View Insights",
      stepNumber: 2,
      totalSteps: 3
    },
    {
      title: "Export & Share Reports",
      description: "Export your data or send reports via email. Your data is automatically saved locally.",
      icon: <Download className="text-purple-500" size={32} />,
      buttonText: "Get Started!",
      stepNumber: 3,
      totalSteps: 3
    }
  ];
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('expense-tracker-theme', theme);
  }, [theme]);
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expense-tracker-data', JSON.stringify(expenses));
  }, [expenses]);
  
  // Show tutorial on first visit
  useEffect(() => {
    if (expenses.length === 0) {
      const hasSeen = localStorage.getItem('has-seen-tutorial');
      if (!hasSeen) {
        setTimeout(() => {
          setShowTutorial(true);
        }, 500);
      }
    }
  }, [expenses.length]);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // Complete tutorial
  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('has-seen-tutorial', 'true');
  };
  
  // Notification handler
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification('Please enter valid title and amount', 'error');
      return;
    }
    
    if (isEditing) {
      setExpenses(prev => prev.map(exp => 
        exp.id === formData.id ? formData : exp
      ));
      showNotification('Transaction updated successfully');
    } else {
      const newExpense = {
        ...formData,
        id: Date.now().toString(),
        amount: parseFloat(formData.amount).toFixed(2)
      };
      setExpenses(prev => [newExpense, ...prev]);
      showNotification('Transaction added successfully');
    }
    
    setFormData({
      id: '',
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: ''
    });
    setIsEditing(false);
  };
  
  const handleEdit = (expense) => {
    setFormData(expense);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      showNotification('Transaction deleted');
    }
  };
  
  const cancelEdit = () => {
    setFormData({
      id: '',
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: ''
    });
    setIsEditing(false);
  };
  
  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Title', 'Amount', 'Description'];
    const csvData = expenses.map(exp => [
      exp.date,
      exp.type,
      exp.category,
      exp.title,
      `$${parseFloat(exp.amount).toFixed(2)}`,
      exp.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'expenses.csv', 'text/csv');
    showNotification('CSV file downloaded');
    setShowExportModal(false);
  };
  
  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalIncome,
      totalExpenses,
      balance,
      transactions: expenses
    };
    
    downloadFile(JSON.stringify(data, null, 2), 'expenses.json', 'application/json');
    showNotification('JSON file downloaded');
    setShowExportModal(false);
  };
  
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Email handler
  const handleSendEmail = (e) => {
    e.preventDefault();
    
    if (!emailForm.recipient) {
      showNotification('Please enter recipient email', 'error');
      return;
    }
    
    // Simulate email sending
    const report = generateEmailReport();
    console.log('Email sent to:', emailForm.recipient);
    console.log('Report:', report);
    
    showNotification(`Report sent to ${emailForm.recipient}`);
    setShowEmailModal(false);
    setEmailForm({
      recipient: '',
      subject: 'Expense Report',
      message: 'Please find my expense report attached.'
    });
  };
  
  const generateEmailReport = () => {
    return `
Expense Report - Generated on ${new Date().toLocaleDateString()}

SUMMARY:
• Total Income: $${totalIncome.toFixed(2)}
• Total Expenses: $${totalExpenses.toFixed(2)}
• Net Balance: $${balance.toFixed(2)}

RECENT TRANSACTIONS:
${expenses.slice(0, 10).map(exp => 
  `• ${exp.date} - ${exp.title}: $${parseFloat(exp.amount).toFixed(2)} (${exp.type})`
).join('\n')}

CATEGORY BREAKDOWN:
${Object.entries(categoryTotals).map(([cat, amount]) => 
  `• ${cat}: $${amount.toFixed(2)}`
).join('\n')}
    `;
  };
  
  // Import from CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const newExpenses = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
              obj[header.toLowerCase()] = values[index];
            });
            return {
              id: Date.now().toString() + Math.random(),
              title: obj.title || 'Imported',
              amount: obj.amount ? parseFloat(obj.amount.replace('$', '')).toFixed(2) : '0.00',
              category: obj.category || 'Other',
              date: obj.date || new Date().toISOString().split('T')[0],
              type: (obj.type || 'expense').toLowerCase(),
              description: obj.description || ''
            };
          });
        
        setExpenses(prev => [...newExpenses, ...prev]);
        showNotification(`${newExpenses.length} transactions imported`);
        e.target.value = '';
      } catch (error) {
        showNotification('Error importing CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };
  
  // Clear all data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setExpenses([]);
      showNotification('All data cleared');
    }
  };
  
  // Add sample data
  const addSampleData = () => {
    const sampleData = [
      { id: '1', title: 'Monthly Salary', amount: '3500.00', category: 'Salary', date: new Date().toISOString().split('T')[0], type: 'income', description: 'Monthly paycheck' },
      { id: '2', title: 'Grocery Shopping', amount: '245.75', category: 'Food', date: new Date().toISOString().split('T')[0], type: 'expense', description: 'Weekly groceries' },
      { id: '3', title: 'Electric Bill', amount: '89.50', category: 'Utilities', date: new Date().toISOString().split('T')[0], type: 'expense', description: 'Monthly electricity' },
    ];
    
    setExpenses(sampleData);
    showNotification('Sample data added');
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : <CreditCard size={16} />;
  };
  
  // Get current tutorial step
  const currentTutorialStep = tutorialSteps[currentStep];
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
    }`}>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            {/* Tutorial Header */}
            <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white bg-opacity-20'}`}>
                    {currentTutorialStep.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentTutorialStep.title}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {tutorialSteps.map((_, index) => (
                        <div 
                          key={index}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentStep 
                              ? 'w-8 bg-white' 
                              : index < currentStep 
                              ? 'w-4 bg-blue-300' 
                              : 'w-2 bg-blue-400'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={completeTutorial}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Tutorial Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <span className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-blue-600'
                    }`}>
                      {currentTutorialStep.stepNumber}
                    </span>
                  </div>
                </div>
                
                <p className={`text-lg text-center mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {currentTutorialStep.description}
                </p>
                
                {/* Step content */}
                {currentStep === 0 && (
                  <div className={`rounded-xl p-4 mb-6 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-blue-100'
                        }`}>
                          <span className="text-blue-500 font-bold">1</span>
                        </div>
                        <span className="font-medium">Track Income & Expenses</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-green-100'
                        }`}>
                          <span className="text-green-500 font-bold">2</span>
                        </div>
                        <span className="font-medium">Categorize Transactions</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-purple-100'
                        }`}>
                          <span className="text-purple-500 font-bold">3</span>
                        </div>
                        <span className="font-medium">Export & Share Reports</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 1 && (
                  <div className={`rounded-xl p-4 mb-6 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-green-100'
                        }`}>
                          <Plus className="text-green-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">Add Transactions</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Track all your income and expenses
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-blue-100'
                        }`}>
                          <Filter className="text-blue-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">Filter & Sort</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Organize by category, date, or type
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className={`rounded-xl p-4 mb-6 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-purple-100'
                        }`}>
                          <Download className="text-purple-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">Export Data</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            CSV, JSON formats
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-blue-100'
                        }`}>
                          <Mail className="text-blue-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">Email Reports</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Share with yourself or others
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tutorial Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft size={18} />
                  <span>Previous</span>
                </button>
                
                <div className="text-sm text-gray-500">
                  Step {currentTutorialStep.stepNumber} of {currentTutorialStep.totalSteps}
                </div>
                
                <button
                  onClick={() => {
                    if (currentStep < tutorialSteps.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      completeTutorial();
                    }
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                  }`}
                >
                  <span>{currentTutorialStep.buttonText}</span>
                  {currentStep === tutorialSteps.length - 1 ? (
                    <CheckCircle size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className={`transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } shadow-sm border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ExpenseTracker Pro</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your finances efficiently
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Help Button */}
              <button
                onClick={() => setShowTutorial(true)}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <HelpCircle size={18} />
                <span>Help</span>
              </button>
              
              <button 
                onClick={() => setShowExportModal(true)}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Download size={18} />
                <span>Export</span>
              </button>
              
              <button 
                onClick={() => setShowEmailModal(true)}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:opacity-90 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white'
                }`}
              >
                <Mail size={18} />
                <span>Share Report</span>
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                <div className="space-y-1">
                  <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                  <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                  <div className={`w-6 h-0.5 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } px-4 py-3`}>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => { setShowExportModal(true); setMobileMenuOpen(false); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <Download size={18} />
              <span>Export Data</span>
            </button>
            
            <button 
              onClick={() => { setShowEmailModal(true); setMobileMenuOpen(false); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
              }`}
            >
              <Mail size={18} />
              <span>Email Report</span>
            </button>
            
            <button
              onClick={() => { setShowTutorial(true); setMobileMenuOpen(false); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <HelpCircle size={18} />
              <span>Show Tutorial</span>
            </button>
            
            <div className="pt-2 border-t border-gray-700">
              <div className="flex space-x-4">
                <button 
                  onClick={() => { setViewMode('list'); setMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  List View
                </button>
                <button 
                  onClick={() => { setViewMode('chart'); setMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    viewMode === 'chart'
                      ? theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Chart View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Empty State */}
        {expenses.length === 0 && !showTutorial && (
          <div className={`mb-8 rounded-2xl p-8 text-center transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
          }`}>
            <div className="max-w-md mx-auto">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
              }`}>
                <Wallet className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to ExpenseTracker Pro!</h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start tracking your expenses and income. Your data will be saved automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowTutorial(true)}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                  }`}
                >
                  Show Tutorial
                </button>
                <button
                  onClick={addSampleData}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Add Sample Data
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Overview */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Income Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-800'
                  }`}>
                    Total Income
                  </p>
                  <p className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-green-100' : 'text-green-900'
                  }`}>
                    ${totalIncome.toFixed(2)}
                  </p>
                  <p className={`text-sm mt-2 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    +12% from last month
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <TrendingUp className="text-green-500" size={24} />
                </div>
              </div>
            </div>
            
            {/* Expenses Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-800'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Total Expenses
                  </p>
                  <p className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-red-100' : 'text-red-900'
                  }`}>
                    ${totalExpenses.toFixed(2)}
                  </p>
                  <p className={`text-sm mt-2 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    -5% from last month
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <TrendingDown className="text-red-500" size={24} />
                </div>
              </div>
            </div>
            
            {/* Balance Card */}
            <div className={`rounded-2xl p-6 shadow-sm transition-colors duration-300 ${
              theme === 'dark'
                ? balance >= 0 
                  ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800'
                  : 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-800'
                : balance >= 0
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${
                    theme === 'dark'
                      ? balance >= 0 ? 'text-blue-300' : 'text-amber-300'
                      : balance >= 0 ? 'text-blue-800' : 'text-amber-800'
                  }`}>
                    Net Balance
                  </p>
                  <p className={`text-3xl font-bold ${
                    balance >= 0
                      ? theme === 'dark' ? 'text-blue-100' : 'text-blue-900'
                      : theme === 'dark' ? 'text-amber-100' : 'text-amber-900'
                  }`}>
                    ${balance.toFixed(2)}
                  </p>
                  <p className={`text-sm mt-2 ${
                    theme === 'dark'
                      ? balance >= 0 ? 'text-blue-400' : 'text-amber-400'
                      : balance >= 0 ? 'text-blue-600' : 'text-amber-600'
                  }`}>
                    {balance >= 0 ? 'Positive balance' : 'Negative balance'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  balance >= 0
                    ? theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    : theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'
                }`}>
                  <Wallet className={
                    balance >= 0
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  } size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form & Filters */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add Transaction Form */}
            <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                {isEditing && (
                  <button 
                    onClick={cancelEdit}
                    className={`text-sm flex items-center ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X size={16} className="mr-1" />
                    Cancel Edit
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'border border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="e.g., Grocery shopping"
                      required
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Amount ($) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'border border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border border-gray-300 text-gray-900'
                        }`}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-3.5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} size={20} />
                    </div>
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          checked={formData.type === 'expense'}
                          onChange={handleInputChange}
                          className={`mr-2 focus:ring-red-500 ${
                            theme === 'dark' ? 'text-red-500' : 'text-red-600'
                          }`}
                        />
                        <span className={theme === 'dark' ? 'text-red-400' : 'text-red-700'}>Expense</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          checked={formData.type === 'income'}
                          onChange={handleInputChange}
                          className={`mr-2 focus:ring-green-500 ${
                            theme === 'dark' ? 'text-green-500' : 'text-green-600'
                          }`}
                        />
                        <span className={theme === 'dark' ? 'text-green-400' : 'text-green-700'}>Income</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'border border-gray-300 text-gray-900'
                        }`}
                      />
                      <Calendar className={`absolute right-4 top-3.5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} size={20} />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'border border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                
                <div className={`mt-6 pt-6 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    type="submit"
                    className={`w-full py-3 px-6 rounded-xl font-medium text-white transition ${
                      isEditing 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90'
                    }`}
                  >
                    {isEditing ? (
                      <span className="flex items-center justify-center">
                        <Check size={20} className="mr-2" />
                        Update Transaction
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Plus size={20} className="mr-2" />
                        Add Transaction
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Filters & Transaction List */}
            <div>
              {/* Filters */}
              {expenses.length > 0 && (
                <div className={`rounded-2xl shadow-sm border p-6 mb-8 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <Filter className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type Filter */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Transaction Type
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'income', 'expense'].map(type => (
                          <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              activeFilter === type
                                ? type === 'income' 
                                  ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                  : type === 'expense'
                                  ? theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
                                  : theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type === 'all' ? 'All Transactions' : 
                             type === 'income' ? 'Income Only' : 'Expenses Only'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Time Filter */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Time Period
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'week', 'month', 'quarter'].map(period => (
                          <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              timeFilter === period
                                ? theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                                : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {period === 'all' ? 'All Time' : 
                             period === 'week' ? 'Last 7 Days' :
                             period === 'month' ? 'Last 30 Days' : 'Last 90 Days'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 pt-6 flex justify-between items-center ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } border-t`}>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Showing {filteredExpenses.length} of {expenses.length} transactions
                    </span>
                    
                    <div className="flex space-x-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportCSV}
                        accept=".csv"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Import CSV
                      </button>
                      <button
                        onClick={handleClearData}
                        className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-red-900/30 text-red-300 border border-red-800 hover:bg-red-800/30'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transaction List */}
              {expenses.length > 0 ? (
                <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-6 py-4 border-b flex justify-between items-center ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h2 className="text-xl font-bold">Transaction History</h2>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'list'
                            ? theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                            : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <FileText size={20} />
                      </button>
                      <button 
                        onClick={() => setViewMode('chart')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'chart'
                            ? theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                            : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <PieChart size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {viewMode === 'list' ? (
                    <div className={`divide-y ${
                      theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
                    }`}>
                      {filteredExpenses.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <Filter className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={24} />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No matching transactions</h3>
                          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            Try changing your filter settings
                          </p>
                        </div>
                      ) : (
                        filteredExpenses.map(expense => (
                          <div key={expense.id} className={`px-6 py-4 transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${
                                  expense.type === 'income'
                                    ? theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50'
                                    : theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50'
                                }`}>
                                  {getCategoryIcon(expense.category)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{expense.title}</h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className={`text-sm ${
                                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      {expense.date}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      expense.type === 'income'
                                        ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                        : theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {expense.type}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {expense.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <span className={`text-lg font-bold ${
                                  expense.type === 'income'
                                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                }`}>
                                  {expense.type === 'income' ? '+' : '-'}${parseFloat(expense.amount).toFixed(2)}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(expense)}
                                    className={`p-2 transition-colors ${
                                      theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'
                                    }`}
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(expense.id)}
                                    className={`p-2 transition-colors ${
                                      theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                                    }`}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {expense.description && (
                              <p className={`mt-3 text-sm ml-12 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {expense.description}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // Chart View
                    <div className="p-6">
                      <div className="mb-6">
                        <h3 className={`font-medium mb-4 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          Expenses by Category
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(categoryTotals).map(([category, amount]) => {
                            const percentage = (amount / totalExpenses * 100).toFixed(1);
                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className={`font-medium ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {category}
                                  </span>
                                  <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                                    ${amount.toFixed(2)} ({percentage}%)
                                  </span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <div 
                                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Empty transaction state
                <div className={`rounded-2xl shadow-sm border p-12 text-center transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="max-w-md mx-auto">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <FileText className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={32} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className={`mb-6 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Add your first transaction to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Categories & Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className={`rounded-2xl p-6 transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'
            }`}>
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => { setShowExportModal(true); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-white border border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      <Download className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        CSV, JSON formats
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={20} />
                </button>
                
                <button
                  onClick={() => { setShowEmailModal(true); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-white border border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
                    }`}>
                      <Mail className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Email Report</h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Send to yourself or others
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={20} />
                </button>
                
                <button
                  onClick={() => setShowTutorial(true)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-white border border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                    }`}>
                      <HelpCircle className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Show Tutorial</h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Learn how to use the app
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} size={20} />
                </button>
              </div>
            </div>
            
            {/* Categories Overview */}
            {Object.keys(categoryTotals).length > 0 && (
              <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className="text-xl font-bold mb-6">Expense Categories</h2>
                
                <div className="space-y-4">
                  {Object.entries(categoryTotals)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => {
                      const cat = categories.find(c => c.id === category);
                      return (
                        <div 
                          key={category} 
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, category }))}
                        >
                          <div className="flex items-center space-x-3">
                            {cat && (
                              <div className={`p-2 rounded-lg ${cat.bg}`}>
                                <div className={cat.color}>{cat.icon}</div>
                              </div>
                            )}
                            <span className="font-medium">{category}</span>
                          </div>
                          <span className="font-bold">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}
            
            {/* Data Stats */}
            {expenses.length > 0 && (
              <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className="text-xl font-bold mb-6">Statistics</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Transactions</span>
                    <span className="font-bold">{expenses.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Income Transactions</span>
                    <span className="font-bold text-green-500">
                      {expenses.filter(e => e.type === 'income').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Expense Transactions</span>
                    <span className="font-bold text-red-500">
                      {expenses.filter(e => e.type === 'expense').length}
                    </span>
                  </div>
                  
                  <div className={`pt-4 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      Data is automatically saved to your browser's local storage
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl w-full max-w-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Email Expense Report</h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSendEmail}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={emailForm.recipient}
                      onChange={(e) => setEmailForm({...emailForm, recipient: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'border border-gray-300'
                      }`}
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'border border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Message
                    </label>
                    <textarea
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                      rows="3"
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'border border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <div className={`rounded-xl p-4 mb-4 ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                    }`}>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        The report will include your transaction history, category breakdown, and financial summary.
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className={`flex-1 py-3 rounded-xl font-medium transition ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'
                        }`}
                      >
                        <span className="flex items-center justify-center">
                          <Send size={18} className="mr-2" />
                          Send Email
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(false)}
                        className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl w-full max-w-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Export Data</h3>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className={`font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Export Format
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={exportToCSV}
                      className={`p-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-2 border-blue-800 hover:bg-gray-600'
                          : 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <FileText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
                      <span className="font-medium mt-2">CSV</span>
                      <span className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Spreadsheet format
                      </span>
                    </button>
                    
                    <button
                      onClick={exportToJSON}
                      className={`p-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Database className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} size={24} />
                      <span className="font-medium mt-2">JSON</span>
                      <span className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Structured data
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transform transition-transform duration-300 ${
          notification.type === 'error'
            ? theme === 'dark'
              ? 'bg-red-900/30 border border-red-800 text-red-300'
              : 'bg-red-50 border border-red-200 text-red-800'
            : theme === 'dark'
            ? 'bg-green-900/30 border border-green-800 text-green-300'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <X className="mr-2" size={20} />
            ) : (
              <Check className="mr-2" size={20} />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className={`mt-12 py-8 border-t transition-colors duration-300 ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Wallet className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={20} />
                <span className="font-bold">ExpenseTracker Pro</span>
              </div>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Professional financial management tool
              </p>
            </div>
            
            <div className={`text-sm flex items-center space-x-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              <button
                onClick={() => setShowTutorial(true)}
                className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Show Tutorial
              </button>
              <span>•</span>
              <span>Data stored locally • {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpenseTracker;
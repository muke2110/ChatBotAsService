import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Documentation = () => {
  const sections = [
    {
      title: 'Getting Started',
      content: [
        {
          subtitle: 'Integration',
          text: 'To integrate the chatbot into your website, add the following script to your HTML:',
          code: `<script src="https://your-domain.com/chatbot.js?clientId=YOUR_CLIENT_ID"></script>`,
        }
      ]
    },
    {
      title: 'Error Codes',
      content: [
        {
          subtitle: 'Authentication Errors',
          items: [
            { code: '401', description: 'Unauthorized - Invalid or missing authentication token' },
            { code: '403', description: 'Forbidden - Insufficient permissions' }
          ]
        },
        {
          subtitle: 'API Errors',
          items: [
            { code: '400', description: 'Bad Request - Invalid parameters or request body' },
            { code: '404', description: 'Not Found - Resource not found' },
            { code: '429', description: 'Too Many Requests - Rate limit exceeded' },
            { code: '500', description: 'Internal Server Error - Something went wrong on our end' }
          ]
        }
      ]
    },
    {
      title: 'Configuration',
      content: [
        {
          subtitle: 'Customization Options',
          text: 'You can customize the chatbot appearance and behavior through the Settings page:',
          items: [
            'Theme colors (primary, text, background)',
            'Chat widget position',
            'Welcome message',
            'Bot name'
          ]
        }
      ]
    },
    {
      title: 'Best Practices',
      content: [
        {
          subtitle: 'Document Preparation',
          items: [
            'Keep documents clear and concise',
            'Use proper formatting for better understanding',
            'Update documents regularly to maintain accuracy',
            'Remove outdated or irrelevant information'
          ]
        },
        {
          subtitle: 'Integration Tips',
          items: [
            'Test the chatbot thoroughly before going live',
            'Monitor chatbot performance regularly',
            'Keep your API keys secure',
            'Implement proper error handling'
          ]
        }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Documentation</h1>
          
          {sections.map((section, index) => (
            <div key={index} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {section.title}
              </h2>
              
              {section.content.map((item, contentIndex) => (
                <div key={contentIndex} className="mb-8">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                    {item.subtitle}
                  </h3>
                  
                  {item.text && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {item.text}
                    </p>
                  )}
                  
                  {item.code && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <code className="text-sm text-white font-mono">
                        {item.code}
                      </code>
                    </div>
                  )}
                  
                  {item.items && (
                    <ul className="space-y-3">
                      {item.items.map((listItem, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 text-primary-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {typeof listItem === 'string' ? listItem : `${listItem.code} - ${listItem.description}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation; 
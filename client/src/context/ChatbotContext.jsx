import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateContextualAnswer } from '../services/aiService';

// Create the context
const ChatbotContext = createContext();

// Custom hook to use the chatbot context
export const useChatbot = () => useContext(ChatbotContext);

// Chatbot provider component
export const ChatbotProvider = ({ children }) => {
  // State for chat messages
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setChatHistory([]);
  };
  
  // Toggle chat panel
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  // Add a welcome message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "Hi there! I'm your Exam Buddy assistant. I can help you study insurance concepts, explain answers, or provide study tips. How can I help you today?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages.length]);
  
  // Function to send a message to the chatbot
  const sendMessage = async (text, context = null) => {
    if (!text.trim()) return;
    
    // Generate a unique ID for this message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the topic from context to ensure consistency
    const messageTopic = context?.topic || '';
    console.log('Message topic:', messageTopic);
    
    // Add user message to the chat
    const userMessage = {
      id: messageId,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      context,
      topic: messageTopic // Store the topic with the message
    };
    
    // Check if this is a duplicate message (sent within the last second)
    const isDuplicate = messages.some(msg => 
      msg.sender === 'user' && 
      msg.text === text && 
      (new Date(msg.timestamp).getTime() > Date.now() - 1000)
    );
    
    if (!isDuplicate) {
      // Filter out previous messages with different topics to prevent mixing
      const relevantMessages = messages.filter(msg => 
        !msg.topic || msg.topic === messageTopic || !messageTopic
      );
      
      setMessages([...relevantMessages, userMessage]);
      
      // Update chat history - only include relevant messages
      const relevantHistory = chatHistory.filter(item => 
        !item.context?.topic || item.context.topic === messageTopic || !messageTopic
      );
      
      setChatHistory([...relevantHistory, { role: 'user', content: text, context, topic: messageTopic }]);
      
      // Show typing indicator
      setIsTyping(true);
    } else {
      console.log('Prevented duplicate message:', text);
      return; // Don't process duplicate messages
    }
    
    try {
      // Generate a response based on the user's message and context
      const response = await generateChatbotResponse(text, chatHistory, userMessage.context);
      
      // Generate a unique ID for the bot response
      const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add bot response to the chat
      const botMessage = {
        id: responseId,
        text: response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        context: userMessage.context,
        questionId: userMessage.id, // Link this response to the original question
        topic: messageTopic // Maintain topic consistency
      };
      
      // Check if this is a duplicate response
      const isDuplicateResponse = messages.some(msg => 
        msg.sender === 'ai' && 
        msg.text === response && 
        (new Date(msg.timestamp).getTime() > Date.now() - 3000)
      );
      
      if (!isDuplicateResponse) {
        console.log('Sending AI response with context:', botMessage);
        // Only include messages with the same topic
        const topicFilteredMessages = messages.filter(msg => 
          !msg.topic || msg.topic === messageTopic || !messageTopic
        );
        setMessages([...topicFilteredMessages, botMessage]);
      } else {
        console.log('Prevented duplicate AI response');
      }
      
      // Update chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: response, context: userMessage.context, topic: messageTopic }]);
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        topic: messageTopic // Maintain topic consistency
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Hide typing indicator
      setIsTyping(false);
    }
  };
  
  // Function to generate a response based on the user's message, chat history, and context
  const generateChatbotResponse = async (message, history, context) => {
    try {
      console.log('Generating tutor response for:', context?.subject, context?.topic);
      
      // If this is a tutor-specific message
      if (context && context.role === 'tutor') {
        // Use our AI-powered tutor response generator
        const aiResponse = await generateTutorResponse(context.subject, context.topic, message);
        if (aiResponse) {
          return aiResponse;
        }
        // Fall back to local generation if AI response fails
        return generateDynamicTutorResponse(message, context.subject, context.topic, context.messageId);
      }
      
      const lowerMessage = message.toLowerCase();
      
      // For general chatbot messages (not tutor-specific)
      if (lowerMessage.includes('study tip')) {
        return getRandomStudyTip();
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm your Exam Buddy assistant. How can I help you today?";
      } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! I'm here to help you succeed in your studies.";
      } else if (lowerMessage.includes('what can you do') || lowerMessage.includes('help me')) {
        return "I can help you study for exams, provide practice questions, track your progress, and offer study tips. Just let me know what you need!";
      } else if (lowerMessage.includes('how does this work') || lowerMessage.includes('how to use')) {
        return "Exam Buddy helps you prepare for exams with flashcards and voice recognition. You can practice answering questions out loud, and I'll evaluate your answers. You can also use this chat to ask me questions about concepts or get study tips.";
      }
      
      // Default response
      return "I'm here to help with your exam preparation. You can ask me about specific topics, request practice questions, or get study tips.";
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      return "I'm sorry, I'm having trouble understanding. Could you try rephrasing your question?";
    }
  };
  
  // Generate a dynamic tutor response that's unique for each question
  const generateDynamicTutorResponse = (question, subject, topic, messageId) => {
    console.log(`Generating dynamic response for: ${subject} - ${topic} - ${question} (ID: ${messageId})`);
    
    // Create a unique seed based on the question and message ID to ensure different responses
    const seed = hashString(`${subject}-${topic}-${question}-${messageId}`);
    const rng = seedRandom(seed);
    
    // Knowledge base for different subjects
    const knowledgeBase = {
      'Insurance Exam': {
        'Risk Management': [
          'Risk management is the systematic process of identifying, assessing, and prioritizing risks followed by coordinated application of resources to minimize, monitor, and control the probability or impact of unfortunate events.',
          'The key steps in risk management include risk identification, risk assessment, risk control, and risk financing.',
          'Risk can be managed through various methods including avoidance, reduction, transfer, and retention.',
          'Insurance is a common form of risk transfer where the financial risk is shifted to another party.',
          'Enterprise Risk Management (ERM) is a comprehensive approach that considers risks across the entire organization.'
        ],
        'Property Insurance': [
          'Property insurance provides financial protection against loss or damage to the insured\'s property caused by covered perils such as fire, theft, or natural disasters.',
          'There are different types of property insurance including homeowners insurance, commercial property insurance, and renters insurance.',
          'Property insurance policies can be written on either a named perils basis (covering only specifically listed perils) or an all-risk/open perils basis (covering all perils except those specifically excluded).',
          'The value of property can be insured based on actual cash value (replacement cost minus depreciation) or replacement cost (cost to replace with new property of like kind and quality).',
          'Important coverages in property insurance include building coverage, personal property coverage, loss of use coverage, and additional coverages like debris removal.'
        ],
        'Risk Financing': [
          'Risk financing involves arranging for funds to pay for losses that occur.',
          'Methods of risk financing include insurance, self-insurance, captive insurance companies, and risk retention groups.',
          'The choice of risk financing method depends on factors like risk tolerance, financial capacity, and regulatory requirements.',
          'Insurance premiums are calculated based on exposure, loss history, coverage limits, and deductibles.',
          'Alternative risk transfer (ART) methods include catastrophe bonds, weather derivatives, and finite risk insurance.'
        ]
      },
      'AWS Certification': {
        'EC2': [
          'Amazon Elastic Compute Cloud (EC2) provides scalable computing capacity in the AWS cloud.',
          'EC2 instances are virtual servers that can run applications in the AWS infrastructure.',
          'EC2 instance types are optimized for different use cases such as compute-optimized, memory-optimized, and storage-optimized.',
          'Auto Scaling allows you to automatically adjust the number of EC2 instances based on demand.',
          'EC2 security groups act as virtual firewalls controlling inbound and outbound traffic to instances.'
        ],
        'S3': [
          'Amazon Simple Storage Service (S3) is an object storage service offering industry-leading scalability, data availability, security, and performance.',
          'S3 storage classes include Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier, and Glacier Deep Archive.',
          'S3 bucket policies control access to buckets and objects within them.',
          'S3 versioning keeps multiple versions of an object in the same bucket.',
          'S3 lifecycle rules automate the transition of objects between storage classes or their deletion.'
        ]
      },
      'Tax Professional': {
        'Income Tax': [
          'Income tax is a tax imposed on individuals or entities on their income or profits.',
          'Progressive tax systems impose higher tax rates on higher income levels.',
          'Taxable income is generally total income minus allowable deductions and exemptions.',
          'Tax credits directly reduce the amount of tax owed, while deductions reduce the amount of income subject to tax.',
          'Different types of income may be taxed at different rates, such as ordinary income, capital gains, and dividends.'
        ],
        'Tax Planning': [
          'Tax planning involves analyzing a financial situation from a tax perspective to ensure tax efficiency.',
          'Strategies include timing of income and deductions, investment choices, and retirement planning.',
          'Tax-advantaged accounts like 401(k)s and IRAs can help reduce current or future tax liability.',
          'Estate planning is important for minimizing estate and inheritance taxes.',
          'International tax planning must consider treaties, foreign tax credits, and anti-avoidance rules.'
        ]
      }
    };
    
    // Get relevant knowledge for the subject and topic
    const subjectData = knowledgeBase[subject] || {};
    const topicData = subjectData[topic] || [];
    
    if (!topicData || topicData.length === 0) {
      return `I don't have specific information about ${topic} in ${subject}, but I can help you find resources on this topic.`;
    }
    
    // Analyze the question to determine what kind of response to generate
    const lowerQuestion = question.toLowerCase();
    let responseType = 'definition'; // default
    
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('define') || lowerQuestion.includes('meaning')) {
      responseType = 'definition';
    } else if (lowerQuestion.includes('how') || lowerQuestion.includes('process') || lowerQuestion.includes('steps')) {
      responseType = 'process';
    } else if (lowerQuestion.includes('why') || lowerQuestion.includes('important') || lowerQuestion.includes('benefit')) {
      responseType = 'importance';
    } else if (lowerQuestion.includes('example') || lowerQuestion.includes('instance') || lowerQuestion.includes('case')) {
      responseType = 'example';
    } else if (lowerQuestion.includes('difference') || lowerQuestion.includes('compare') || lowerQuestion.includes('versus')) {
      responseType = 'comparison';
    }
    
    // Select relevant facts based on the question type and randomize their order
    // to create a unique response each time
    const selectedFacts = [...topicData]
      .sort(() => rng() - 0.5)
      .slice(0, 3 + Math.floor(rng() * 3)); // Select 3-5 facts
    
    // Generate a unique introduction based on the question type
    let intro = '';
    switch (responseType) {
      case 'definition':
        intro = `${topic} is a critical concept in ${subject}. `;
        break;
      case 'process':
        intro = `The process of ${topic} in ${subject} involves several important steps. `;
        break;
      case 'importance':
        intro = `${topic} is important in ${subject} for several key reasons. `;
        break;
      case 'example':
        intro = `Let me provide some practical examples of ${topic} in ${subject}. `;
        break;
      case 'comparison':
        intro = `When comparing different aspects of ${topic} in ${subject}, several distinctions emerge. `;
        break;
      default:
        intro = `Regarding ${topic} in ${subject}, there are several important points to understand. `;
    }
    
    // Generate a unique conclusion
    const conclusions = [
      `Understanding these aspects of ${topic} is essential for mastery of ${subject}.`,
      `These principles of ${topic} form the foundation of knowledge in ${subject}.`,
      `By grasping these concepts of ${topic}, you'll be well-prepared for your ${subject} exam.`,
      `These key points about ${topic} are frequently tested in ${subject} examinations.`,
      `Mastering these elements of ${topic} will significantly enhance your understanding of ${subject}.`
    ];
    const conclusion = conclusions[Math.floor(rng() * conclusions.length)];
    
    // Combine the introduction, selected facts, and conclusion to create a unique response
    return intro + selectedFacts.join(' ') + ' ' + conclusion;
  };
  
  // Simple string hashing function to create a seed for the random number generator
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Simple seedable random number generator
  const seedRandom = (seed) => {
    return function() {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
  };
  
  // Function to generate a tutor response using the AI service
  const generateTutorResponse = async (subject, topic, message) => {
    try {
      // Create a well-structured prompt for the AI
      const prompt = `As a knowledgeable tutor for ${subject}, specifically about the topic "${topic}", provide a helpful, accurate, and educational response to this question: "${message}". Include specific details and examples where appropriate. Be conversational but informative.`;
      
      // Format chat history for the AI service
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get response from AI service with conversation history
      const { answer } = await generateContextualAnswer(prompt, formattedHistory);
      
      // Process the response to remove any prompt text that might have been included
      if (answer && answer.trim()) {
        // Check if the response contains the prompt text and remove it
        const cleanedAnswer = answer
          .replace(prompt, '')
          .replace(`As a knowledgeable tutor for ${subject}`, '')
          .replace(`specifically about the topic "${topic}"`, '')
          .replace(`provide a helpful, accurate, and educational response to this question:`, '')
          .replace(`"${message}"`, '')
          .replace(`Include specific details and examples where appropriate.`, '')
          .replace(`Be conversational but informative.`, '')
          .trim();
        
        return cleanedAnswer || answer;
      }
      return null;
    } catch (error) {
      console.error('Error in generateTutorResponse:', error);
      return null;
    }
  };
  
  // Function to get a tutor response based on the message and context (fallback)
  const getTutorResponse = (message, subject, topic) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for definition/explanation questions
    if (lowerMessage.includes('what is') || lowerMessage.includes('explain') || 
        lowerMessage.includes('define') || lowerMessage.includes('how does')) {
      return `In ${subject}, ${topic} refers to a key concept that involves understanding the principles and applications in various scenarios. It's important to know how ${topic} relates to other concepts in ${subject} and how it's applied in real-world situations.`;
    }
    
    // Check for example requests
    if (lowerMessage.includes('example') || lowerMessage.includes('instance') || 
        lowerMessage.includes('sample')) {
      return `Here's an example related to ${topic} in ${subject}: When applying ${topic} principles, professionals typically follow a structured approach that includes assessment, analysis, and implementation. For instance, in a case where you need to determine the appropriate action, you would first evaluate all relevant factors, then apply the ${topic} framework to reach a conclusion.`;
    }
    
    // Check for importance questions
    if (lowerMessage.includes('why') || lowerMessage.includes('important') || 
        lowerMessage.includes('significance')) {
      return `${topic} is crucial in ${subject} because it forms the foundation for many advanced concepts. Understanding ${topic} thoroughly will help you excel in your ${subject} exam and in real-world applications. It's particularly important because it connects to many other areas within ${subject}.`;
    }
    
    // Check for study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') || 
        lowerMessage.includes('remember') || lowerMessage.includes('memorize')) {
      return `To effectively study ${topic} for your ${subject} exam, I recommend creating concept maps to visualize how it connects to other topics. Practice with sample questions that test your understanding of ${topic} principles. Also, try teaching the concept to someone else - explaining it out loud helps reinforce your understanding.`;
    }
    
    // Default response for other types of questions
    return getTutorFallbackResponse(subject, topic);
  };
  
  // Function to get a tutor fallback response
  const getTutorFallbackResponse = (subject, topic) => {
    const responses = [
      `That's a good question about ${topic}. In ${subject}, it's important to understand the core concepts before diving into details.`,
      `When studying ${topic} for your ${subject} exam, focus on the key principles and how they apply in different scenarios.`,
      `${topic} is an important area in ${subject}. Make sure to review the related concepts and practice with example questions.`,
      `I recommend creating flashcards for the key terms related to ${topic} in your ${subject} studies.`,
      `For ${topic}, try explaining the concept in your own words to test your understanding. This is a great way to prepare for your ${subject} exam.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Function to get a random study tip
  const getRandomStudyTip = () => {
    const studyTips = [
      "Try the Pomodoro technique: Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break of 15-30 minutes.",
      "Create flashcards for key insurance terms and review them regularly. Spaced repetition helps with long-term retention.",
      "Teach the concept to someone else (or pretend to). Explaining concepts out loud helps solidify your understanding.",
      "Practice with sample exam questions to get familiar with the format and types of questions you'll encounter.",
      "Connect new insurance concepts to real-world examples or scenarios you're familiar with.",
      "Review your notes before bed. Studies show that sleep helps consolidate memory.",
      "Use mnemonic devices to remember lists or complex concepts.",
      "Take care of your physical health. Regular exercise, good nutrition, and adequate sleep improve cognitive function.",
      "Create mind maps to visualize how different insurance concepts relate to each other.",
      "Schedule regular review sessions. Reviewing material multiple times helps move information to long-term memory."
    ];
    
    return studyTips[Math.floor(Math.random() * studyTips.length)];
  };
  
  // Context value
  const value = {
    messages,
    isTyping,
    isChatOpen,
    sendMessage,
    clearChat,
    toggleChat
  };
  
  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;

// Tutor Service - Provides subject-specific content for the tutor feature
import { insurance } from '../subjects/insurance';
import { awsCertifications } from '../subjects/awsCertifications';
import { taxProfessional } from '../subjects/taxProfessional';

// Collection of all subjects
const allSubjects = [insurance, awsCertifications, taxProfessional];

/**
 * Get all available subjects
 * @returns {Array} List of all subjects
 */
export const getAllSubjects = () => {
  return allSubjects;
};

/**
 * Get a subject by name
 * @param {string} subjectName - Name of the subject to retrieve
 * @returns {Object|null} The subject object or null if not found
 */
export const getSubjectByName = (subjectName) => {
  return allSubjects.find(subject => 
    subject.name.toLowerCase() === subjectName.toLowerCase()
  ) || null;
};

/**
 * Get all topics for a specific subject
 * @param {string} subjectName - Name of the subject
 * @returns {Array} List of all topics in the subject
 */
export const getTopicsForSubject = (subjectName) => {
  const subject = getSubjectByName(subjectName);
  if (!subject || !subject.groups) return [];
  
  // Flatten all topics from all groups
  return subject.groups.reduce((allTopics, group) => {
    return [...allTopics, ...(group.topics || [])];
  }, []);
};

/**
 * Get lesson content for a specific topic
 * @param {string} topic - The topic to get content for
 * @param {string} subjectName - Optional subject name to narrow search
 * @returns {Object|null} Lesson content or null if not found
 */
export const getLessonContent = (topic, subjectName = null) => {
  if (!topic) return null;
  
  // Normalize inputs for comparison
  const normalizedTopic = topic.toLowerCase().trim();
  
  // First try exact match
  if (tutorContent[normalizedTopic]) {
    return tutorContent[normalizedTopic];
  }
  
  // Then try case-insensitive key matching
  const topicKey = Object.keys(tutorContent).find(key => 
    key.toLowerCase() === normalizedTopic
  );
  
  if (topicKey) {
    return tutorContent[topicKey];
  }
  
  // Try to find a similar topic
  const similarTopic = findSimilarTopic(normalizedTopic);
  if (similarTopic) {
    return similarTopic;
  }
  
  // If no match found, generate a default lesson structure
  if (normalizedTopic.length > 0) {
    return {
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      description: `Learn about ${topic} and its importance in ${subjectName || 'this field'}.`,
      subject: subjectName || 'General Knowledge',
      sections: [
        {
          title: `Introduction to ${topic}`,
          content: `${topic} is an important concept to understand. This lesson will cover the key principles and applications of ${topic}.`
        },
        {
          title: `Key Concepts in ${topic}`,
          content: `When studying ${topic}, focus on understanding the fundamental principles and how they apply in different scenarios.`
        }
      ]
    };
  }
  
  return null;
};

/**
 * Find a similar topic if exact match is not found
 * @param {string} topic - The topic to find similar matches for
 * @returns {Object|null} The most similar topic content or null
 */
const findSimilarTopic = (topic) => {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const key in tutorContent) {
    // Calculate similarity (simple contains check)
    if (key.includes(topic) || topic.includes(key)) {
      const score = Math.min(key.length, topic.length) / Math.max(key.length, topic.length);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = tutorContent[key];
      }
    }
  }
  
  return bestMatch;
};

/**
 * Generate a quiz for a specific topic
 * @param {string} topic - The topic to generate a quiz for
 * @param {number} questionCount - Number of questions to include (default: 5)
 * @returns {Array} Array of quiz questions
 */
export const generateQuizForTopic = (topic, questionCount = 5) => {
  if (!topic) {
    return generateGenericQuiz('general knowledge', questionCount);
  }
  
  const lesson = getLessonContent(topic);
  if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
    return generateGenericQuiz(topic, questionCount);
  }
  
  // Return the predefined quiz or a subset if we need fewer questions
  return lesson.quiz.slice(0, questionCount);
};

/**
 * Generate a generic quiz when no predefined quiz exists
 * @param {string} topic - The topic to generate a quiz for
 * @param {number} questionCount - Number of questions to include
 * @returns {Array} Array of generic quiz questions
 */
const generateGenericQuiz = (topic, questionCount) => {
  // This would ideally call an AI service to generate questions
  // For now, we'll return some generic questions
  return [
    {
      question: `What is the primary purpose of ${topic}?`,
      options: [
        `To provide a framework for understanding ${topic}`,
        `To establish regulatory compliance in ${topic}`,
        `To optimize performance in ${topic}-related tasks`,
        `To reduce risks associated with ${topic}`
      ],
      answer: 0
    },
    {
      question: `Which of the following is NOT typically associated with ${topic}?`,
      options: [
        `Standard practices`,
        `Regulatory oversight`,
        `Automated implementation`,
        `Manual documentation`
      ],
      answer: 2
    }
  ];
};

// Tutor content database - organized by topic
const tutorContent = {
  // Insurance Exam Content
  "underwriting": {
    title: "Underwriting",
    description: "Learn about the process of evaluating risk and determining policy issuance.",
    subject: "Insurance Exam",
    sections: [
      {
        title: "Basic Principles",
        content: `Underwriting is the process of evaluating risks to determine whether to accept them and at what price. The key principles include:
        
        1. Risk Assessment - Analyzing the likelihood and potential severity of loss
        2. Risk Selection - Deciding which risks to accept or decline
        3. Risk Classification - Grouping similar risks together
        4. Rate Adequacy - Setting premiums that cover expected losses and expenses
        5. Equity - Charging fair rates based on risk characteristics`
      },
      {
        title: "Underwriting Process",
        content: `The underwriting process typically follows these steps:
        
        1. Application Review - Examining the information provided by the applicant
        2. Information Gathering - Collecting additional data through reports, inspections, etc.
        3. Risk Evaluation - Assessing the level of risk based on all available information
        4. Decision Making - Accepting, declining, or modifying the application
        5. Rating - Determining the appropriate premium for accepted risks`
      },
      {
        title: "Underwriting Factors",
        content: `Underwriters consider various factors when evaluating risks, including:
        
        • For Property Insurance: Construction type, occupancy, protection class, location
        • For Auto Insurance: Driving record, vehicle type, usage, location
        • For Life Insurance: Age, health status, family history, lifestyle
        • For Health Insurance: Medical history, age, occupation, location`
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of underwriting?",
        options: [
          "To sell insurance policies",
          "To evaluate risks and determine appropriate premiums",
          "To process claims",
          "To market insurance products"
        ],
        answer: 1
      },
      {
        question: "Which of the following is NOT a basic principle of underwriting?",
        options: [
          "Risk Assessment",
          "Risk Selection",
          "Risk Elimination",
          "Risk Classification"
        ],
        answer: 2
      }
    ]
  },
  
  "property insurance": {
    title: "Property Insurance",
    description: "Understand coverage for physical assets and buildings.",
    subject: "Insurance Exam",
    sections: [
      {
        title: "Types of Property Insurance",
        content: `Property insurance includes several types of coverage:
        
        1. Homeowners Insurance - Covers private residences and personal property
        2. Commercial Property Insurance - Protects business buildings and contents
        3. Flood Insurance - Specifically covers damage from flooding
        4. Earthquake Insurance - Covers damage from seismic events
        5. Renters Insurance - Protects personal property for those who don't own their residence`
      },
      {
        title: "Covered Perils",
        content: `Property insurance typically covers losses caused by specific perils, which may include:
        
        • Fire and smoke damage
        • Lightning strikes
        • Windstorm and hail
        • Explosion
        • Theft and vandalism
        • Water damage (from plumbing issues)
        • Weight of ice, snow, or sleet
        
        Policies may be "named peril" (covering only listed perils) or "all-risk" (covering all perils except those specifically excluded).`
      },
      {
        title: "Valuation Methods",
        content: `Property can be valued in different ways for insurance purposes:
        
        1. Actual Cash Value (ACV) - Replacement cost minus depreciation
        2. Replacement Cost - Cost to replace with new property of like kind and quality
        3. Functional Replacement Cost - Cost to replace with less costly but functionally equivalent property
        4. Market Value - The price a willing buyer would pay a willing seller
        5. Agreed Value - A specific amount agreed upon by insurer and insured`
      }
    ],
    quiz: [
      {
        question: "Which of the following is NOT typically covered by standard property insurance?",
        options: [
          "Fire damage",
          "Theft",
          "Flood damage",
          "Windstorm damage"
        ],
        answer: 2
      },
      {
        question: "What is Actual Cash Value (ACV)?",
        options: [
          "The market value of the property",
          "Replacement cost plus inflation",
          "Replacement cost minus depreciation",
          "The original purchase price of the property"
        ],
        answer: 2
      }
    ]
  },
  
  "risk management": {
    title: "Risk Management",
    description: "Learn strategies for identifying, assessing, and controlling risks.",
    subject: "Insurance Exam",
    sections: [
      {
        title: "Risk Management Process",
        content: `The risk management process consists of these key steps:
        
        1. Risk Identification - Recognizing potential sources of loss
        2. Risk Assessment - Evaluating the potential frequency and severity of losses
        3. Risk Control - Implementing measures to reduce or eliminate risks
        4. Risk Financing - Arranging for funds to pay for losses that occur
        5. Risk Administration - Ongoing monitoring and adjustment of the program`
      },
      {
        title: "Risk Control Techniques",
        content: `Organizations can control risks using these methods:
        
        1. Avoidance - Eliminating the activity or exposure that creates the risk
        2. Prevention - Taking measures to reduce the likelihood of loss
        3. Reduction - Minimizing the potential severity of losses
        4. Segregation - Separating exposure units to reduce potential loss
        5. Duplication - Creating backups or redundancies to maintain operations`
      },
      {
        title: "Risk Financing Methods",
        content: `Methods to pay for losses include:
        
        1. Retention - Setting aside funds to pay for potential losses
        2. Transfer - Shifting the financial burden to another party
        3. Insurance - Transferring risk to an insurance company for a premium
        4. Captive Insurance - Creating a subsidiary insurance company
        5. Risk Pooling - Sharing risks with other similar organizations`
      }
    ],
    quiz: [
      {
        question: "What is the first step in the risk management process?",
        options: [
          "Risk Assessment",
          "Risk Identification",
          "Risk Control",
          "Risk Financing"
        ],
        answer: 1
      },
      {
        question: "Which risk control technique involves eliminating the activity that creates the risk?",
        options: [
          "Avoidance",
          "Prevention",
          "Reduction",
          "Segregation"
        ],
        answer: 0
      }
    ]
  },
  
  // AWS Certification Content
  "aws certified cloud practitioner": {
    title: "AWS Certified Cloud Practitioner",
    description: "Foundational understanding of AWS Cloud services and concepts.",
    subject: "AWS Certifications",
    sections: [
      {
        title: "Cloud Concepts",
        content: `Key cloud computing concepts include:
        
        1. Definition of Cloud Computing - On-demand delivery of IT resources
        2. Benefits of Cloud - Agility, elasticity, cost savings, global deployment
        3. Types of Cloud Computing - IaaS, PaaS, SaaS
        4. Cloud Deployment Models - Public, private, hybrid`
      },
      {
        title: "AWS Core Services",
        content: `Fundamental AWS services include:
        
        1. Compute - EC2, Lambda, Elastic Beanstalk
        2. Storage - S3, EBS, EFS, Glacier
        3. Database - RDS, DynamoDB, Redshift
        4. Networking - VPC, Route 53, CloudFront
        5. Security - IAM, AWS Shield, WAF`
      },
      {
        title: "Security and Compliance",
        content: `AWS security concepts include:
        
        1. Shared Responsibility Model - AWS secures cloud infrastructure, customers secure their data
        2. IAM - Identity and access management for AWS resources
        3. Security Services - GuardDuty, Inspector, Macie
        4. Compliance Programs - HIPAA, PCI DSS, SOC, ISO certifications`
      }
    ],
    quiz: [
      {
        question: "What is the AWS service that provides virtual servers in the cloud?",
        options: [
          "AWS Lambda",
          "Amazon EC2",
          "Amazon S3",
          "Amazon RDS"
        ],
        answer: 1
      },
      {
        question: "Which of the following is NOT a benefit of cloud computing?",
        options: [
          "Increased agility",
          "Elastic scaling",
          "Reduced need for security measures",
          "Pay-as-you-go pricing"
        ],
        answer: 2
      }
    ]
  },
  
  "aws certified solutions architect – associate": {
    title: "AWS Certified Solutions Architect – Associate",
    description: "Design and deploy scalable, highly available systems on AWS.",
    subject: "AWS Certifications",
    sections: [
      {
        title: "Designing Resilient Architectures",
        content: `Key concepts for resilient architectures include:
        
        1. High Availability - Using multiple AZs and regions
        2. Fault Tolerance - Designing systems to continue operating despite failures
        3. Disaster Recovery - Backup and restore, pilot light, warm standby, multi-site
        4. Decoupling Mechanisms - SQS, SNS, EventBridge`
      },
      {
        title: "Security Best Practices",
        content: `Security best practices include:
        
        1. Defense in Depth - Multiple security controls
        2. Least Privilege - Minimal permissions needed
        3. Encryption - Data at rest and in transit
        4. Network Security - Security groups, NACLs, VPC design
        5. Monitoring and Auditing - CloudTrail, CloudWatch, Config`
      },
      {
        title: "Cost Optimization",
        content: `Strategies for cost optimization include:
        
        1. Right Sizing - Selecting appropriate instance types
        2. Reserved Instances - Discounted pricing for committed usage
        3. Spot Instances - Using spare capacity at reduced cost
        4. Storage Tiering - Using appropriate storage classes
        5. Monitoring and Analysis - Cost Explorer, Budgets, Trusted Advisor`
      }
    ],
    quiz: [
      {
        question: "Which AWS service should you use to decouple application components?",
        options: [
          "Amazon EC2",
          "Amazon SQS",
          "Amazon RDS",
          "Amazon Route 53"
        ],
        answer: 1
      },
      {
        question: "What is the best practice for securing AWS account root user?",
        options: [
          "Use it for daily administrative tasks",
          "Share the credentials with team members",
          "Enable MFA and use it only when absolutely necessary",
          "Store credentials in a shared password manager"
        ],
        answer: 2
      }
    ]
  },
  
  // Tax Professional Content
  "introduction to tax preparation": {
    title: "Introduction to Tax Preparation",
    description: "Learn the fundamentals of tax preparation and filing.",
    subject: "Tax Professional Training",
    sections: [
      {
        title: "Tax Preparation Overview",
        content: `The tax preparation process includes:
        
        1. Information Gathering - Collecting taxpayer data and documents
        2. Tax Return Preparation - Analyzing data and completing forms
        3. Quality Review - Checking for accuracy and completeness
        4. Filing - Submitting returns to tax authorities
        5. Follow-up - Addressing notices and amendments`
      },
      {
        title: "Tax Preparer Responsibilities",
        content: `Tax preparers have several key responsibilities:
        
        1. Due Diligence - Verifying information provided by clients
        2. Accuracy - Preparing returns that correctly reflect the taxpayer's situation
        3. Confidentiality - Protecting taxpayer information
        4. Ethics - Adhering to professional standards and regulations
        5. Continuing Education - Staying current with tax laws and changes`
      },
      {
        title: "Tax Software and Tools",
        content: `Common tools used in tax preparation include:
        
        1. Professional Tax Software - Programs designed for tax professionals
        2. IRS e-Services - Online tools for tax professionals
        3. Research Resources - Tax publications, guides, and databases
        4. Document Management - Systems for organizing and storing client information
        5. Client Communication Tools - Secure portals and messaging systems`
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of due diligence in tax preparation?",
        options: [
          "To maximize tax refunds",
          "To verify the accuracy of taxpayer information",
          "To expedite the filing process",
          "To reduce the risk of an audit"
        ],
        answer: 1
      },
      {
        question: "Which of the following is NOT typically part of the tax preparation process?",
        options: [
          "Information gathering",
          "Quality review",
          "Representing clients in tax court",
          "Filing the return"
        ],
        answer: 2
      }
    ]
  },
  
  "income reporting": {
    title: "Income Reporting",
    description: "Learn how to properly report various types of income on tax returns.",
    subject: "Tax Professional Training",
    sections: [
      {
        title: "Types of Income",
        content: `Common types of income include:
        
        1. Wages and Salaries - Reported on Form W-2
        2. Self-Employment Income - Reported on Schedule C
        3. Investment Income - Interest, dividends, capital gains
        4. Retirement Income - Pensions, annuities, Social Security
        5. Other Income - Rental income, alimony, prizes, gambling winnings`
      },
      {
        title: "Income Documentation",
        content: `Income is documented through various forms:
        
        1. Form W-2 - Wage and tax statement from employers
        2. Form 1099-NEC - Nonemployee compensation
        3. Form 1099-MISC - Miscellaneous income
        4. Form 1099-INT/DIV - Interest and dividend income
        5. Form 1099-R - Distributions from retirement plans
        6. Schedule K-1 - Income from partnerships, S corporations, estates, and trusts`
      },
      {
        title: "Special Income Situations",
        content: `Special income situations include:
        
        1. Foreign Income - Income earned outside the U.S.
        2. Bartering - Exchange of goods or services
        3. Virtual Currency - Cryptocurrency transactions
        4. Canceled Debt - Forgiven or discharged debt
        5. Hobby Income - Income from activities not engaged in for profit`
      }
    ],
    quiz: [
      {
        question: "Which form reports wages and salaries paid to employees?",
        options: [
          "Form 1099-NEC",
          "Form W-2",
          "Schedule C",
          "Form 1099-MISC"
        ],
        answer: 1
      },
      {
        question: "Which of the following is generally NOT taxable income?",
        options: [
          "Gambling winnings",
          "Gifts received",
          "Self-employment income",
          "Interest from bank accounts"
        ],
        answer: 1
      }
    ]
  }
};

// Export the content database for direct access if needed
export const getTutorContentDatabase = () => tutorContent;

/**
 * Get lesson for a specific topic - alias for getLessonContent for compatibility
 * @param {string} subjectName - Name of the subject
 * @param {string} topic - The topic to get content for
 * @returns {Object|null} Lesson content or null if not found
 */
export const getLesson = (subjectName, topic) => {
  return getLessonContent(topic, subjectName);
};

/**
 * Get quiz for a specific topic - alias for generateQuizForTopic for compatibility
 * @param {string} subjectName - Name of the subject
 * @param {string} topic - The topic to get quiz for
 * @returns {Object} Quiz content with questions array
 */
export const getQuizForTopic = (subjectName, topic) => {
  if (!topic || topic.trim() === '') {
    // Generate a default quiz for the subject area
    const defaultQuestions = [
      {
        question: `Which of the following is most important to understand in ${subjectName || 'this field'}?`,
        options: [
          'Theoretical concepts',
          'Practical applications',
          'Historical development',
          'All of the above'
        ],
        answer: 3,
        explanation: 'A comprehensive understanding requires knowledge of theory, application, and historical context.'
      },
      {
        question: `What is the best approach to studying ${subjectName || 'this subject'}?`,
        options: [
          'Memorizing key terms',
          'Understanding core concepts',
          'Practicing with examples',
          'Using a combination of methods'
        ],
        answer: 3,
        explanation: 'Effective learning combines memorization, conceptual understanding, and practical application.'
      },
      {
        question: 'Which study technique is most effective for long-term retention?',
        options: [
          'Cramming before the exam',
          'Highlighting text in books',
          'Spaced repetition and active recall',
          'Passive reading'
        ],
        answer: 2,
        explanation: 'Research shows that spaced repetition and active recall significantly improve long-term retention.'
      }
    ];
    
    return {
      questions: defaultQuestions.map(q => ({
        text: q.question,
        options: q.options,
        correctAnswer: q.answer,
        explanation: q.explanation
      }))
    };
  }
  
  // First try to get the lesson which includes the quiz
  const lesson = getLesson(subjectName, topic);
  
  // If the lesson has a quiz, return it
  if (lesson && lesson.quiz && lesson.quiz.length > 0) {
    return {
      questions: lesson.quiz.map(q => ({
        text: q.question || q.text, // Handle both formats
        options: q.options,
        correctAnswer: q.answer || q.correctAnswer, // Handle both formats
        explanation: q.explanation || null
      }))
    };
  }
  
  // Otherwise generate a generic quiz
  const genericQuestions = generateGenericQuiz(topic || subjectName, 5);
  return {
    questions: genericQuestions.map(q => ({
      text: q.question || `Question about ${topic}`,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.answer || 0,
      explanation: q.explanation || `This question tests your knowledge of ${topic}.`
    }))
  };
};

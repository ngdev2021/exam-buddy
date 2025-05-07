// AI Service for generating contextual answers and evaluations
// This service provides AI-powered functionality for the Exam Buddy application

// API endpoint for AI services
const AI_ENDPOINT = import.meta.env.VITE_API_URL + '/api/ai';

/**
 * Generate a contextual answer for a given question
 * @param {string} question - The question or prompt to generate an answer for
 * @param {Array} history - Previous conversation history
 * @returns {Promise<{answer: string, keyPoints: string[]}>} - The generated answer and key points
 */
export const generateContextualAnswer = async (question, history = []) => {
  try {
    // Extract context from the question
    let subject = 'General';
    let topic = '';
    let actualQuestion = question;
    
    // Check if this is a tutor question (contains specific patterns)
    if (question.includes('tutor for') && question.includes('topic')) {
      // This is a tutor question, extract the subject, topic and actual question
      const subjectMatch = question.match(/tutor for ([^,]+),/) || 
                         question.match(/tutor for ([^"]+)"/);
      const topicMatch = question.match(/topic "([^"]+)"/) || 
                       question.match(/topic: "([^"]+)"/);
      const questionMatch = question.match(/question: "([^"]+)"/) || 
                          question.match(/question:\s*"([^"]+)"/);
      
      subject = subjectMatch ? subjectMatch[1].trim() : 'General';
      topic = topicMatch ? topicMatch[1].trim() : '';
      actualQuestion = questionMatch ? questionMatch[1].trim() : question;
      
      console.log('Extracted from prompt:', { subject, topic, actualQuestion });
    } else {
      // For regular questions, extract topic
      const topicMatch = question.match(/What is ([^?]+)\??/);
      topic = topicMatch ? topicMatch[1].trim() : question;
    }
    
    // Call the OpenAI API to generate a response
    return await callOpenAI(subject, topic, actualQuestion, history);
  } catch (error) {
    console.error('Error generating contextual answer:', error);
    // Fallback to local generation if API fails
    return generateLocalAnswer(error.topic || 'general knowledge');
  }
};

/**
 * Call the OpenAI API to generate a response
 * @param {string} subject - The subject area
 * @param {string} topic - The specific topic
 * @param {string} question - The actual question
 * @param {Array} history - Previous conversation history
 * @returns {Promise<{answer: string, keyPoints: string[]}>} - The generated answer
 */
const callOpenAI = async (subject, topic, question, history = []) => {
  try {
    console.log(`Calling backend tutor API for: ${subject} - ${topic} - ${question}`);
    
    // Prepare the API endpoint URL
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/tutor-response`;
    
    // Make the API call to our backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject,
        topic,
        question,
        history: history.slice(-10) // Send the last 10 messages for context
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend API error:', errorData);
      
      // Fall back to local generation if the API call fails
      console.log('API call failed, falling back to local generation');
      if (subject.toLowerCase().includes('insurance')) {
        return generateInsuranceAnswer(topic, question);
      } else if (subject.toLowerCase().includes('aws')) {
        return generateAWSAnswer(topic, question);
      } else if (subject.toLowerCase().includes('tax')) {
        return generateTaxAnswer(topic, question);
      }
      return generateLocalAnswer(topic);
    }
    
    // Parse the response
    const data = await response.json();
    
    return {
      answer: data.answer,
      keyPoints: data.keyPoints || []
    };
  } catch (error) {
    console.error('Error calling tutor API:', error);
    
    // Fall back to local generation if the API call fails
    console.log('API call failed, falling back to local generation');
    if (subject.toLowerCase().includes('insurance')) {
      return generateInsuranceAnswer(topic, question);
    } else if (subject.toLowerCase().includes('aws')) {
      return generateAWSAnswer(topic, question);
    } else if (subject.toLowerCase().includes('tax')) {
      return generateTaxAnswer(topic, question);
    }
    return generateLocalAnswer(topic);
  }
};

/**
 * Extract key points from an AI-generated answer
 * @param {string} answer - The full answer text
 * @returns {string[]} - Array of extracted key points
 */
const extractKeyPoints = (answer) => {
  // Look for bullet points, numbered lists, or key phrases
  const bulletPoints = answer.match(/[•\-*]\s+([^\n]+)/g) || [];
  const numberedPoints = answer.match(/\d+\.\s+([^\n]+)/g) || [];
  const keyPhrases = answer.match(/important|key|critical|essential|fundamental|significant/gi) || [];
  
  let keyPoints = [];
  
  // Extract from bullet points
  bulletPoints.forEach(point => {
    const cleaned = point.replace(/[•\-*]\s+/, '').trim();
    if (cleaned && cleaned.length > 10) {
      keyPoints.push(cleaned);
    }
  });
  
  // Extract from numbered points
  numberedPoints.forEach(point => {
    const cleaned = point.replace(/\d+\.\s+/, '').trim();
    if (cleaned && cleaned.length > 10 && !keyPoints.includes(cleaned)) {
      keyPoints.push(cleaned);
    }
  });
  
  // If we don't have enough points, extract sentences with key phrases
  if (keyPoints.length < 3) {
    const sentences = answer.split(/[.!?]\s+/);
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed && trimmed.length > 15 && trimmed.length < 100) {
        for (const phrase of keyPhrases) {
          if (trimmed.toLowerCase().includes(phrase.toLowerCase())) {
            if (!keyPoints.some(point => point.includes(trimmed))) {
              keyPoints.push(trimmed);
              break;
            }
          }
        }
      }
    });
  }
  
  // If we still don't have enough points, just take the first few sentences
  if (keyPoints.length < 3) {
    const sentences = answer.split(/[.!?]\s+/);
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed && trimmed.length > 15 && trimmed.length < 100) {
        if (!keyPoints.some(point => point.includes(trimmed))) {
          keyPoints.push(trimmed);
        }
      }
    });
  }
  
  // Limit to 4 key points
  return keyPoints.slice(0, 4);
};

/**
 * Generate a tutor-specific answer for educational content
 * @param {string} subject - The subject area (e.g., Insurance Exam)
 * @param {string} topic - The specific topic within the subject
 * @param {string} question - The actual question being asked
 * @returns {{answer: string, keyPoints: string[]}} - The generated answer and key points
 */
const generateTutorAnswer = (subject, topic, question) => {
  console.log(`Generating tutor answer for: ${subject} - ${topic} - ${question}`);
  
  // Lowercase for easier matching
  const lowerQuestion = question.toLowerCase();
  
  // Check for specific subtopics first
  if (lowerQuestion.includes('risk financing') || topic.toLowerCase().includes('risk financing')) {
    return {
      answer: `Risk Financing is a critical component of the risk management process that focuses on arranging funds to cover losses that may occur. It involves determining how to pay for losses after risk control measures have been implemented. The main methods of risk financing include: 1) Insurance - transferring risk to an insurance company for a premium; 2) Self-insurance - setting aside funds to pay for potential losses; 3) Captive insurance - creating a subsidiary insurance company; 4) Risk retention groups - sharing risks with similar organizations; and 5) Catastrophe bonds - transferring risk to investors. For insurance professionals, understanding risk financing is essential as it helps determine the appropriate balance between risk transfer and retention based on an organization's risk tolerance and financial capacity.`,
      keyPoints: ['Methods of funding losses', 'Insurance as risk transfer', 'Self-insurance options', 'Financial planning for risk']
    };
  }
  
  // Risk Management general responses
  if (topic.toLowerCase().includes('risk management')) {
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('define')) {
      return {
        answer: `Risk management is the systematic process of identifying, assessing, and prioritizing risks, followed by coordinated efforts to minimize, monitor, and control the impact of unfortunate events. In the insurance context, it involves analyzing potential risks that individuals or organizations face and developing strategies to manage these risks through various methods including risk avoidance, risk reduction, risk transfer (like purchasing insurance), and risk retention. For example, a business might identify fire as a risk, reduce it by installing sprinklers, transfer some risk by purchasing property insurance, and retain a portion through a deductible.`,
        keyPoints: ['Identification of risks', 'Assessment and prioritization', 'Risk control methods', 'Insurance as risk transfer']
      };
    }
    
    if (lowerQuestion.includes('example') || lowerQuestion.includes('instance')) {
      return {
        answer: `Here's a practical example of risk management in action: Consider a homeowner in a flood-prone area. They would first identify flooding as a significant risk. Then they would assess the potential impact (damage to property, replacement costs, temporary housing needs). To manage this risk, they might: 1) Avoid risk by not storing valuable items in the basement, 2) Reduce risk by installing flood barriers and a sump pump, 3) Transfer risk by purchasing flood insurance, and 4) Retain some risk by accepting they'll pay a deductible if a claim occurs. This comprehensive approach demonstrates how risk management principles are applied in real-world situations.`,
        keyPoints: ['Practical example of homeowner flood risk', 'Risk identification and assessment', 'Multiple risk management strategies', 'Insurance as part of the solution']
      };
    }
    
    if (lowerQuestion.includes('process') || lowerQuestion.includes('steps')) {
      return {
        answer: `The risk management process typically follows five key steps: 1) Risk Identification - discovering and recognizing potential risks through various methods like surveys, historical data analysis, and expert opinions; 2) Risk Assessment - evaluating the likelihood and potential severity of each identified risk; 3) Risk Control - implementing strategies to reduce or eliminate risks through avoidance, prevention, or reduction techniques; 4) Risk Financing - arranging for funds to pay for losses that occur, primarily through insurance or self-funding; and 5) Risk Administration - ongoing monitoring and adjustment of the risk management program to ensure its effectiveness. This systematic approach ensures that risks are handled comprehensively and efficiently.`,
        keyPoints: ['Five-step process', 'Identification and assessment', 'Control strategies', 'Financing options', 'Ongoing administration']
      };
    }
    
    // Default risk management response
    return {
      answer: `Risk management in the insurance field involves identifying potential threats, assessing their likelihood and impact, and developing strategies to handle them effectively. These strategies typically include risk avoidance (eliminating the activity), risk reduction (implementing safety measures), risk transfer (purchasing insurance), and risk retention (accepting certain risks). Understanding risk management is crucial for insurance professionals as it forms the foundation of how insurance products are designed, priced, and offered to clients. It helps in making informed decisions about which risks to insure and how to structure policies that adequately protect against various types of losses.`,
      keyPoints: ['Risk identification and assessment', 'Risk handling strategies', 'Insurance as risk transfer', 'Policy structure considerations']
    };
  }
  
  // Generate subject-specific responses for other topics
  if (subject.toLowerCase().includes('insurance')) {
    return generateInsuranceAnswer(topic, question);
  }
  
  if (subject.toLowerCase().includes('aws')) {
    return generateAWSAnswer(topic, question);
  }
  
  if (subject.toLowerCase().includes('tax')) {
    return generateTaxAnswer(topic, question);
  }
  
  // Default response if no specific match
  return {
    answer: `${topic} is an important concept in ${subject}. When studying this topic, focus on understanding the core principles and how they apply in different scenarios. Make sure to review related concepts and practice with example questions to reinforce your understanding.`,
    keyPoints: ['Core principles', 'Practical applications', 'Related concepts', 'Practice exercises']
  };
};

/**
 * Generate insurance-specific answers
 * @param {string} topic - The insurance topic
 * @param {string} question - The question being asked
 * @returns {{answer: string, keyPoints: string[]}} - The generated answer
 */
const generateInsuranceAnswer = (topic, question) => {
  const lowerQuestion = question.toLowerCase();
  const lowerTopic = topic.toLowerCase();
  
  // Property Insurance specific responses
  if (lowerTopic.includes('property insurance')) {
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('define')) {
      return {
        answer: `Property Insurance is a type of coverage that protects against damage to or loss of an insured's real property (buildings and structures) and personal property (possessions). It typically provides protection against risks such as fire, theft, vandalism, and certain weather events. Property insurance policies can be written for homeowners, renters, businesses, and other property owners. The key components include the insuring agreement, covered perils, exclusions, conditions, and limits of coverage. For your insurance exam, it's important to understand the difference between named perils policies (which cover only specifically listed risks) and all-risk/open perils policies (which cover all risks except those specifically excluded).`,
        keyPoints: ['Coverage for real and personal property', 'Protection against specific perils', 'Named perils vs. all-risk policies', 'Policy components']
      };
    }
    
    if (lowerQuestion.includes('calculate') || lowerQuestion.includes('premium') || lowerQuestion.includes('cost')) {
      return {
        answer: `Property insurance premiums are calculated based on several key factors: 1) Property Value - the replacement cost or actual cash value of the insured property; 2) Location - properties in areas prone to natural disasters or high crime rates typically have higher premiums; 3) Construction Type - materials used and building features affect fire resistance and durability; 4) Occupancy - how the property is used affects risk levels; 5) Protection Class - proximity to fire stations and hydrants; 6) Claims History - previous claims may increase premiums; and 7) Coverage Limits and Deductibles - higher limits increase premiums while higher deductibles decrease them. Insurers use complex rating algorithms that consider all these factors to determine the final premium amount.`,
        keyPoints: ['Property value and location factors', 'Construction and occupancy considerations', 'Protection class impact', 'Deductible and limit effects']
      };
    }
    
    if (lowerQuestion.includes('cover') || lowerQuestion.includes('include') || lowerQuestion.includes('protect')) {
      return {
        answer: `Property insurance typically covers damage or loss to buildings and personal property caused by covered perils. Standard covered perils often include: fire and smoke damage, lightning strikes, windstorm and hail damage, explosion, theft, vandalism, damage from vehicles or aircraft, riot and civil commotion, and weight of ice/snow/sleet. Most policies also cover additional living expenses if the property becomes uninhabitable due to a covered loss. However, property insurance generally excludes: flood damage (requires separate flood insurance), earthquake damage (requires separate earthquake insurance), normal wear and tear, intentional damage, and damage from war or nuclear hazards. For your exam, it's crucial to understand both what is covered and what is excluded in standard property insurance policies.`,
        keyPoints: ['Standard covered perils', 'Additional living expenses coverage', 'Common exclusions', 'Need for supplemental policies']
      };
    }
  }
  
  // Default insurance response if no specific match
  return {
    answer: `In insurance, ${topic} refers to an important concept that insurance professionals need to understand thoroughly. It involves analyzing risks, understanding policy provisions, and applying industry regulations. When preparing for your insurance exam, make sure to study the specific definitions, exclusions, and conditions related to ${topic}, as these details are often tested.`,
    keyPoints: ['Insurance-specific knowledge', 'Policy provisions', 'Regulatory considerations', 'Exam preparation tips']
  };
};

/**
 * Generate AWS-specific answers
 * @param {string} topic - The AWS topic
 * @param {string} question - The question being asked
 * @returns {{answer: string, keyPoints: string[]}} - The generated answer
 */
const generateAWSAnswer = (topic, question) => {
  return {
    answer: `In AWS certifications, ${topic} is a key service or concept that you'll need to understand for your exam. It involves cloud architecture principles, service capabilities, and best practices for implementation. When studying ${topic}, focus on the specific use cases, configuration options, and how it integrates with other AWS services. The exam will likely test your practical knowledge of when and how to use ${topic} in real-world scenarios.`,
    keyPoints: ['AWS service knowledge', 'Cloud architecture principles', 'Integration with other services', 'Practical implementation']
  };
};

/**
 * Generate tax-specific answers
 * @param {string} topic - The tax topic
 * @param {string} question - The question being asked
 * @returns {{answer: string, keyPoints: string[]}} - The generated answer
 */
const generateTaxAnswer = (topic, question) => {
  return {
    answer: `In tax professional training, ${topic} is an essential area that covers specific tax code provisions, filing requirements, and calculation methods. Understanding ${topic} requires attention to detail and awareness of how tax laws and regulations apply to different situations. For your exam, be sure to study the specific rules, exceptions, and practical applications of ${topic}, as you'll likely need to demonstrate both theoretical knowledge and the ability to apply it to tax scenarios.`,
    keyPoints: ['Tax code provisions', 'Filing requirements', 'Calculation methods', 'Practical applications']
  };
};

/**
 * Local implementation of answer generation for common insurance topics
 * @param {string} topic - The insurance topic
 * @returns {{answer: string, keyPoints: string[]}} - Generated answer and key points
 */
const generateLocalAnswer = (topic) => {
  const lowerTopic = topic.toLowerCase();
  
  // Define answers for common insurance topics
  const topicAnswers = {
    'underwriting': {
      answer: "Underwriting is the process insurance companies use to evaluate risk and determine whether to issue a policy and at what premium rate. It involves analyzing applicant information, assessing risk factors, and applying company guidelines to make approval decisions.",
      keyPoints: [
        "risk assessment",
        "policy issuance decision",
        "premium determination",
        "application evaluation",
        "guidelines application"
      ]
    },
    'property insurance': {
      answer: "Property Insurance is a type of coverage that protects against financial loss from damage to physical assets such as buildings and their contents. It provides compensation for losses resulting from specific perils like fire, theft, or natural disasters, subject to policy terms and conditions.",
      keyPoints: [
        "physical asset protection",
        "building coverage",
        "contents protection",
        "peril compensation",
        "financial loss protection"
      ]
    },
    'policy provisions': {
      answer: "Policy Provisions are the specific terms, conditions, clauses, and stipulations contained within an insurance contract that define the coverage, limitations, exclusions, and obligations of both the insurer and the insured. They establish the framework for how the policy functions and claims are handled.",
      keyPoints: [
        "contract terms",
        "coverage definitions",
        "exclusions",
        "conditions",
        "obligations"
      ]
    },
    'risk management': {
      answer: "Risk Management is the systematic process of identifying, assessing, and prioritizing potential risks, followed by coordinated application of resources to minimize, monitor, and control the probability or impact of unfortunate events. In insurance contexts, it involves strategies to handle risk through avoidance, reduction, transfer, or acceptance.",
      keyPoints: [
        "risk identification",
        "risk assessment",
        "risk mitigation",
        "control measures",
        "strategic planning"
      ]
    },
    'liability insurance': {
      answer: "Liability Insurance provides protection against claims resulting from injuries and damage to people or property. It covers legal costs and payouts for which the insured party would be responsible if found legally liable. Types include personal liability, professional liability, and commercial liability coverage.",
      keyPoints: [
        "legal protection",
        "claim coverage",
        "third-party injury",
        "property damage",
        "legal defense costs"
      ]
    },
    'insurance claim': {
      answer: "An Insurance Claim is a formal request by a policyholder to an insurance company for coverage or compensation for a covered loss or policy event. The claim process involves notification, documentation, investigation, evaluation, and settlement or denial based on policy terms.",
      keyPoints: [
        "formal request",
        "loss compensation",
        "documentation",
        "investigation",
        "settlement process"
      ]
    },
    'premium': {
      answer: "Premium is the amount of money charged by insurance companies for coverage. The cost of the premium is determined by several factors including the type of coverage, the policyholder's risk profile, coverage limits, deductibles, and market conditions. It represents the price paid for transferring risk to the insurer.",
      keyPoints: [
        "insurance cost",
        "regular payment",
        "risk-based pricing",
        "coverage fee",
        "financial consideration"
      ]
    },
    'deductible': {
      answer: "A Deductible is the amount of money a policyholder must pay out-of-pocket toward an insured loss before the insurance company begins to make payments according to the policy. Higher deductibles generally result in lower premium costs as the insured assumes more financial risk.",
      keyPoints: [
        "out-of-pocket expense",
        "claim threshold",
        "self-insured retention",
        "premium reduction factor",
        "risk sharing mechanism"
      ]
    }
  };
  
  // Find the best matching topic
  let bestMatch = null;
  let bestMatchScore = 0;
  
  for (const key in topicAnswers) {
    // Check if topic contains this key or vice versa
    if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
      // Calculate rough similarity score
      const score = key.length / Math.max(key.length, lowerTopic.length);
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = key;
      }
    }
  }
  
  // If we found a good match, return that answer
  if (bestMatch && bestMatchScore > 0.5) {
    return topicAnswers[bestMatch];
  }
  
  // Default generic answer if no specific match found
  return {
    answer: `${topic} is an important concept in insurance that relates to how policies, coverage, and risk are managed within the insurance industry. Understanding this concept helps in navigating insurance decisions and requirements.`,
    keyPoints: [
      "insurance concept",
      "policy related",
      "industry standard",
      "risk consideration",
      "coverage element"
    ]
  };
};

/**
 * Evaluate a user's answer against a contextually generated correct answer
 * @param {string} userAnswer - The user's provided answer
 * @param {string} question - The original question
 * @returns {Promise<{score: number, feedback: string, correctAnswer: string, keyPointsMatched: string[]}>}
 */
export const evaluateAnswerWithAI = async (userAnswer, question) => {
  try {
    // Generate the contextual answer
    const { answer: correctAnswer, keyPoints } = await generateContextualAnswer(question);
    
    // Evaluate the user's answer against the generated answer
    // This would ideally call an AI service, but we'll implement locally for now
    
    // Normalize both answers for comparison
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();
    
    // Calculate simple similarity score
    const similarityScore = calculateSimilarity(normalizedUserAnswer, normalizedCorrectAnswer);
    
    // Check for key points in the user's answer
    const matchedKeyPoints = keyPoints.filter(point => 
      normalizedUserAnswer.includes(point.toLowerCase())
    );
    
    const keyPointScore = keyPoints.length > 0 ? matchedKeyPoints.length / keyPoints.length : 0;
    
    // Calculate overall score (weighted)
    const overallScore = (similarityScore * 0.6) + (keyPointScore * 0.4);
    
    // Generate appropriate feedback
    let feedback = '';
    if (overallScore >= 0.8) {
      feedback = "Excellent answer! You've demonstrated a strong understanding of the concept.";
    } else if (overallScore >= 0.6) {
      feedback = "Good answer! You've covered some key points, but there's room for more detail.";
      if (matchedKeyPoints.length < keyPoints.length) {
        const missedPoints = keyPoints
          .filter(point => !matchedKeyPoints.includes(point))
          .slice(0, 2);
        if (missedPoints.length > 0) {
          feedback += ` Consider including information about ${missedPoints.join(' and ')}.`;
        }
      }
    } else {
      feedback = "Your answer needs improvement. The key aspects to understand include: ";
      feedback += keyPoints.slice(0, 3).join(', ');
    }
    
    return {
      score: overallScore,
      feedback,
      correctAnswer,
      keyPointsMatched: matchedKeyPoints
    };
  } catch (error) {
    console.error('Error evaluating answer with AI:', error);
    return {
      score: 0,
      feedback: "Sorry, there was an error evaluating your answer.",
      correctAnswer: "Unable to generate a correct answer at this time.",
      keyPointsMatched: []
    };
  }
};

/**
 * Generate a dynamic response that simulates a generative AI
 * @param {string} subject - The subject area
 * @param {string} topic - The specific topic
 * @param {string} question - The actual question
 * @returns {Promise<{answer: string, keyPoints: string[]}>} - Dynamically generated answer
 */
const generateDynamicResponse = async (subject, topic, question) => {
  console.log(`Generating dynamic response for: ${subject} - ${topic} - ${question}`);
  
  // In a real implementation, this would call an LLM API like OpenAI
  // Here we're simulating a generative AI by creating dynamic responses
  
  // Create a unique seed based on the question to ensure different questions get different responses
  const seed = hashString(`${subject}-${topic}-${question}`);
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
    },
    'General': {
      'General Knowledge': [
        'General knowledge encompasses a wide range of topics and subjects.',
        'Critical thinking involves objective analysis and evaluation of information to form a judgment.',
        'Problem-solving skills are essential in both academic and real-world contexts.',
        'Effective communication includes clear expression of ideas and active listening.',
        'Continuous learning is important for personal and professional development.'
      ]
    }
  };
  
  // Get relevant knowledge for the subject and topic
  const subjectData = knowledgeBase[subject] || knowledgeBase['General'];
  const topicData = subjectData[topic] || subjectData['General Knowledge'] || Object.values(subjectData)[0];
  
  if (!topicData || topicData.length === 0) {
    return {
      answer: `I don't have specific information about ${topic} in ${subject}, but I can help you find resources on this topic.`,
      keyPoints: ['Research needed', 'Topic exploration', 'Further study recommended']
    };
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
  
  // Generate key points from the facts
  const keyPoints = selectedFacts.map(fact => {
    const words = fact.split(' ').filter(w => w.length > 3);
    const keyWordIndex = Math.floor(rng() * words.length);
    const keyWord = words[keyWordIndex] || 'concept';
    return keyWord.charAt(0).toUpperCase() + keyWord.slice(1);
  });
  
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
  const answer = intro + selectedFacts.join(' ') + ' ' + conclusion;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.floor(rng() * 700)));
  
  return {
    answer,
    keyPoints: keyPoints.slice(0, 4) // Limit to 4 key points
  };
};

/**
 * Simple string hashing function to create a seed for the random number generator
 * @param {string} str - The string to hash
 * @returns {number} - A numeric hash value
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Simple seedable random number generator
 * @param {number} seed - The seed value
 * @returns {function} - A function that returns a random number between 0 and 1
 */
const seedRandom = (seed) => {
  return function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

/**
 * Calculate similarity between two text strings
 * Simple implementation - in production, this would use more sophisticated NLP
 * @param {string} text1 
 * @param {string} text2 
 * @returns {number} Similarity score between 0 and 1
 */
const calculateSimilarity = (text1, text2) => {
  // Split into words and filter out common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                    'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 
                    'about', 'as', 'of', 'that', 'this', 'these', 'those'];
  
  const words1 = text1.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
  const words2 = text2.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Count matching words
  let matches = 0;
  for (const word of words1) {
    if (words2.includes(word)) {
      matches++;
    }
  }
  
  // Calculate Jaccard similarity
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? matches / union : 0;
};

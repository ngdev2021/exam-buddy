import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../context/VoiceContext';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import stringSimilarity from 'string-similarity';
import { evaluateAnswerWithAI, generateContextualAnswer } from '../../services/aiService';

const VoiceFlashcard = ({ 
  question, 
  answer,
  onNext,
  onCorrect,
  onIncorrect,
  culturalVocabularyMode = false
}) => {
  const { speak, transcript, isListening, startListening, stopListening } = useVoice();
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [dynamicAnswer, setDynamicAnswer] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  
  // Reset state when question changes
  useEffect(() => {
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(null);
    setDynamicAnswer('');
    setKeyPoints([]);
    
    // Generate a dynamic answer for this question
    if (question) {
      generateContextualAnswer(question).then(({ answer, keyPoints }) => {
        setDynamicAnswer(answer);
        setKeyPoints(keyPoints);
        console.log('Generated dynamic answer:', answer);
        console.log('Key points:', keyPoints);
      }).catch(err => {
        console.error('Error generating dynamic answer:', err);
      });
    }
  }, [question]);
  
  // Use a ref to track if we've already spoken the question for this specific question instance
  const questionRef = useRef('');
  const hasSpokenRef = useRef(false);
  
  // Speak the question when it changes, but only once per question
  useEffect(() => {
    // Only speak if this is a new question we haven't spoken yet
    if (question && question !== questionRef.current) {
      console.log('New question detected:', question);
      questionRef.current = question;
      hasSpokenRef.current = false;
    }
    
    // Speak the question only once
    if (question && !hasSpokenRef.current) {
      console.log('Speaking question (once):', question);
      speak(question);
      hasSpokenRef.current = true;
    }
  }, [question, speak]);
  
  // Process user's spoken answer
  const handleTranscriptReady = async (transcript) => {
    console.log('Transcript received:', transcript);
    if (transcript && transcript.trim()) {
      setUserAnswer(transcript);
      
      // Use the AI service to evaluate the answer if we have a dynamic answer
      if (dynamicAnswer) {
        try {
          const evaluation = await evaluateAnswerWithAI(transcript, question);
          console.log('AI evaluation result:', evaluation);
          
          // Set feedback based on AI evaluation
          setFeedback(evaluation.feedback);
          
          // Determine if correct based on score
          const isAnswerCorrect = evaluation.score >= 0.8;
          setIsCorrect(isAnswerCorrect);
          
          // Call appropriate callback
          if (isAnswerCorrect) {
            onCorrect && onCorrect();
          } else {
            onIncorrect && onIncorrect();
          }
          
          // Show the answer
          setShowAnswer(true);
          
          // Speak feedback if needed
          speak(evaluation.feedback);
          
        } catch (error) {
          console.error('Error during AI evaluation:', error);
          // Fall back to traditional evaluation
          evaluateAnswer(transcript);
        }
      } else {
        // Fall back to traditional evaluation if dynamic answer isn't available
        evaluateAnswer(transcript);
      }
    } else {
      console.log('Empty transcript received, not processing');
      setFeedback('I didn\'t catch that. Please try speaking again.');
      speak('I didn\'t catch that. Please try speaking again.');
    }
  };
  
  // Start listening for answer
  const handleListenForAnswer = async () => {
    // Reset any previous answers
    setUserAnswer('');
    setFeedback(null);
    
    // Start listening with cultural vocabulary mode if enabled
    console.log('Starting listening with cultural mode:', culturalVocabularyMode);
    await startListening(culturalVocabularyMode); // Pass cultural mode flag
  };
  
  // Evaluate the user's answer with semantic understanding and partial credit
  const evaluateAnswer = (userResponse) => {
    console.log('Evaluating answer:', userResponse);
    
    // Skip empty responses
    if (!userResponse || !userResponse.trim()) {
      console.log('Empty response, not evaluating');
      return;
    }
    
    // Clean up answers for better comparison
    const normalizedUserAnswer = userResponse.toLowerCase()
      .trim()
      .replace(/[.,?!;:()\[\]{}'"-]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
      
    const normalizedCorrectAnswer = answer.toLowerCase()
      .trim()
      .replace(/[.,?!;:()\[\]{}'"-]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
    
    console.log('Normalized user answer:', normalizedUserAnswer);
    console.log('Normalized correct answer:', normalizedCorrectAnswer);
    
    // SECTION 1: MEANING-BASED EVALUATION
    // --------------------------------
    
    // Expanded stop words list to improve semantic extraction
    const stopWords = [
      'this', 'that', 'with', 'from', 'have', 'will', 'your', 'and', 'the', 'for', 'are', 'not', 'but',
      'what', 'who', 'how', 'why', 'when', 'where', 'which', 'there', 'here', 'their', 'they', 'them',
      'these', 'those', 'then', 'than', 'some', 'such', 'very', 'just', 'more', 'most', 'other', 'others',
      'into', 'over', 'under', 'about', 'after', 'before', 'between', 'through', 'during', 'above', 'below',
      'important', 'concept', 'involves', 'understanding', 'principles', 'applications', 'also', 'can', 'may',
      'should', 'would', 'could', 'must', 'might', 'shall', 'will', 'been', 'being', 'was', 'were', 'had',
      'has', 'have', 'having', 'does', 'did', 'doing', 'done', 'get', 'got', 'getting'
    ];
    
    // Enhanced synonyms map for insurance domain
    const synonymsMap = {
      // Process-related terms
      process: ['procedure', 'method', 'approach', 'steps', 'system', 'workflow', 'protocol'],
      procedure: ['process', 'method', 'approach', 'steps', 'system', 'workflow', 'protocol'],
      method: ['process', 'procedure', 'approach', 'steps', 'system', 'technique'],
      
      // Insurance-specific terms
      coverage: ['protection', 'extent', 'scope', 'insure', 'cover', 'safeguard'],
      premium: ['fee', 'charge', 'payment', 'cost', 'price', 'rate'],
      claim: ['assert', 'state', 'request', 'demand', 'file'],
      policy: ['contract', 'agreement', 'document', 'plan'],
      risk: ['hazard', 'danger', 'peril', 'threat', 'exposure', 'vulnerability'],
      liability: ['responsibility', 'obligation', 'duty', 'accountability'],
      deductible: ['excess', 'threshold', 'out-of-pocket'],
      underwriting: ['assessment', 'evaluation', 'analysis'],
      indemnity: ['compensation', 'reimbursement', 'payment', 'settlement'],
      insurer: ['provider', 'carrier', 'company', 'underwriter'],
      insured: ['policyholder', 'customer', 'client', 'covered party'],
      
      // Management terms
      management: ['handling', 'administration', 'control', 'oversight', 'supervision'],
      assessment: ['evaluation', 'analysis', 'appraisal', 'examination'],
      identification: ['recognition', 'detection', 'discovery', 'finding'],
      mitigation: ['reduction', 'minimization', 'alleviation', 'lessening'],
      transfer: ['shift', 'move', 'relocate', 'reassign'],
      avoidance: ['prevention', 'evasion', 'deterrence', 'circumvention'],
      
      // Property insurance terms
      property: ['asset', 'possession', 'belonging', 'real estate', 'building', 'structure'],
      damage: ['harm', 'injury', 'destruction', 'loss', 'impairment'],
      casualty: ['accident', 'mishap', 'disaster', 'incident'],
      provision: ['clause', 'condition', 'stipulation', 'term', 'requirement']
    };
    
    // Fuzzy matching threshold - higher means more exact matches required
    const FUZZY_THRESHOLD = 0.75;
    
    // 1. Extract semantic components from both answers
    // Break down answers into semantic components (subject, action, object, etc.)
    const extractSemanticComponents = (text) => {
      // Extract key terms (non-stop words)
      const terms = text.split(/\s+/).filter(word => word.length >= 3 && !stopWords.includes(word));
      
      // Identify subjects (usually nouns at the beginning)
      const subjects = terms.slice(0, Math.ceil(terms.length * 0.3));
      
      // Identify actions (usually verbs in the middle)
      const actions = terms.slice(Math.ceil(terms.length * 0.3), Math.ceil(terms.length * 0.6));
      
      // Identify objects (usually nouns/concepts at the end)
      const objects = terms.slice(Math.ceil(terms.length * 0.6));
      
      return { terms, subjects, actions, objects };
    };
    
    const userComponents = extractSemanticComponents(normalizedUserAnswer);
    const correctComponents = extractSemanticComponents(normalizedCorrectAnswer);
    
    console.log('User semantic components:', userComponents);
    console.log('Correct semantic components:', correctComponents);
    
    // 2. Calculate semantic similarity scores for each component
    const calculateComponentSimilarity = (userComps, correctComps) => {
      const matchedTerms = correctComps.filter(term =>
        userComps.some(ut =>
          ut === term ||
          ut.includes(term) ||
          term.includes(ut) ||
          stringSimilarity.compareTwoStrings(ut, term) >= FUZZY_THRESHOLD ||
          (synonymsMap[term] && synonymsMap[term].includes(ut))
        )
      );
      return correctComps.length > 0 ? matchedTerms.length / correctComps.length : 0;
    };
    
    const subjectSimilarity = calculateComponentSimilarity(userComponents.subjects, correctComponents.subjects);
    const actionSimilarity = calculateComponentSimilarity(userComponents.actions, correctComponents.actions);
    const objectSimilarity = calculateComponentSimilarity(userComponents.objects, correctComponents.objects);
    
    console.log(`Semantic similarity - Subjects: ${Math.round(subjectSimilarity * 100)}%, Actions: ${Math.round(actionSimilarity * 100)}%, Objects: ${Math.round(objectSimilarity * 100)}%`);
    
    // 3. Calculate overall semantic similarity (weighted)
    const semanticSimilarity = (
      subjectSimilarity * 0.3 + 
      actionSimilarity * 0.3 + 
      objectSimilarity * 0.4
    );
    
    console.log(`Overall semantic similarity: ${Math.round(semanticSimilarity * 100)}%`);
    
    // SECTION 2: CONCEPT UNDERSTANDING
    // --------------------------------
    
    // Identify the question type and extract key concepts
    const questionType = question.toLowerCase().startsWith('what is') ? 'definition' : 
                         question.toLowerCase().includes('how') ? 'process' : 
                         question.toLowerCase().includes('why') ? 'reasoning' : 
                         question.toLowerCase().includes('compare') ? 'comparison' : 'general';
    
    console.log(`Question type detected: ${questionType}`);
    
    // Extract domain and topic from the question
    const questionMatch = question.match(/What is ([^?]+)\??/);
    let topicName = '';
    
    if (questionMatch && questionMatch[1]) {
      topicName = questionMatch[1].toLowerCase().trim();
      console.log(`Topic identified: ${topicName}`);
    }
    
    // Define domain-specific concept categories based on the topic
    const domainConcepts = {};
    
    // Insurance-specific concepts
    if (topicName.includes('insurance') || topicName.includes('policy') || topicName.includes('claim')) {
      domainConcepts['insurance_process'] = ['process', 'procedure', 'method', 'approach', 'steps', 'system', 'workflow'];
      domainConcepts['insurance_entities'] = ['company', 'insurer', 'provider', 'carrier', 'agent', 'broker', 'adjuster', 'underwriter', 'policyholder', 'insured', 'claimant'];
      domainConcepts['insurance_documents'] = ['policy', 'contract', 'certificate', 'form', 'application', 'endorsement', 'rider', 'declaration'];
      domainConcepts['insurance_actions'] = ['file', 'submit', 'process', 'review', 'evaluate', 'assess', 'settle', 'pay', 'deny', 'approve', 'investigate'];
      domainConcepts['insurance_concepts'] = ['premium', 'coverage', 'deductible', 'liability', 'risk', 'loss', 'damage', 'benefit', 'exclusion', 'limit'];
    }
    
    // Claims handling specific concepts
    if (topicName.includes('claims') || topicName.includes('claim handling')) {
      domainConcepts['claims_process'] = ['filing', 'submission', 'intake', 'assessment', 'investigation', 'evaluation', 'settlement', 'payment', 'resolution'];
      domainConcepts['claims_roles'] = ['adjuster', 'investigator', 'examiner', 'specialist', 'manager', 'representative'];
      domainConcepts['claims_documents'] = ['form', 'report', 'statement', 'evidence', 'proof', 'documentation', 'receipt', 'invoice', 'estimate'];
      domainConcepts['claims_outcomes'] = ['approval', 'denial', 'settlement', 'payment', 'rejection', 'acceptance', 'negotiation'];
    }
    
    // If no specific domain concepts were identified, use general concepts
    if (Object.keys(domainConcepts).length === 0) {
      domainConcepts['general_process'] = ['process', 'procedure', 'method', 'approach', 'steps', 'system'];
      domainConcepts['general_entities'] = ['person', 'organization', 'company', 'individual', 'group', 'team'];
      domainConcepts['general_actions'] = ['do', 'perform', 'execute', 'implement', 'conduct', 'carry out'];
      domainConcepts['general_attributes'] = ['important', 'significant', 'essential', 'critical', 'key', 'major'];
    }
    
    // Evaluate conceptual understanding across all concept categories
    const conceptScores = {};
    let totalConceptCategories = Object.keys(domainConcepts).length;
    let matchedConceptCategories = 0;
    
    for (const [category, concepts] of Object.entries(domainConcepts)) {
      // Check how many concepts in this category are matched
      const matchedConcepts = concepts.filter(concept => 
        normalizedUserAnswer.includes(concept) || 
        // Check for word variations (e.g., 'process' matches 'processing')
        concepts.some(c => normalizedUserAnswer.split(' ').some(word => word.startsWith(c)))
      );
      
      const categoryScore = concepts.length > 0 ? matchedConcepts.length / concepts.length : 0;
      conceptScores[category] = categoryScore;
      
      if (categoryScore > 0) {
        matchedConceptCategories++;
        console.log(`Concept category match: ${category} - ${Math.round(categoryScore * 100)}% (${matchedConcepts.length}/${concepts.length} concepts)`);
      }
    }
    
    // Calculate overall conceptual understanding score
    const conceptCoverageScore = totalConceptCategories > 0 ? matchedConceptCategories / totalConceptCategories : 0;
    const conceptDepthScore = Object.values(conceptScores).reduce((sum, score) => sum + score, 0) / totalConceptCategories;
    
    // Combined score with more weight on depth than coverage
    const conceptualUnderstandingScore = (conceptCoverageScore * 0.4) + (conceptDepthScore * 0.6);
    
    console.log(`Conceptual understanding: Coverage ${Math.round(conceptCoverageScore * 100)}%, Depth ${Math.round(conceptDepthScore * 100)}%`);
    console.log(`Overall conceptual score: ${Math.round(conceptualUnderstandingScore * 100)}%`);
    
    // SECTION 3: MULTI-PART ANSWER EVALUATION
    // --------------------------------------
    
    // Check if the correct answer has multiple parts
    const answerParts = answer.split(/\.|;|\n/).filter(part => part.trim().length > 0);
    const isMultiPartAnswer = answerParts.length > 1;
    
    let partialScores = [];
    
    if (isMultiPartAnswer) {
      console.log(`Multi-part answer detected with ${answerParts.length} parts`);
      
      // Evaluate each part of the answer separately
      partialScores = answerParts.map((part, index) => {
        const normalizedPart = part.toLowerCase().trim().replace(/[.,?!;:()\[\]{}'"-]/g, '').replace(/\s+/g, ' ');
        const partTerms = normalizedPart.split(/\s+/).filter(word => word.length >= 3 && !stopWords.includes(word));
        
        // Check if user's answer contains the key terms from this part
        const matchedPartTerms = partTerms.filter(term => normalizedUserAnswer.includes(term));
        const partScore = partTerms.length > 0 ? matchedPartTerms.length / partTerms.length : 0;
        
        console.log(`Part ${index + 1} score: ${Math.round(partScore * 100)}% (${matchedPartTerms.length}/${partTerms.length} terms)`);
        return { part: normalizedPart, score: partScore, matched: matchedPartTerms, total: partTerms };
      });
      
      // Calculate the average score across all parts
      const avgPartialScore = partialScores.reduce((sum, part) => sum + part.score, 0) / partialScores.length;
      console.log(`Average score across all parts: ${Math.round(avgPartialScore * 100)}%`);
    }
    
    // SECTION 4: FINAL EVALUATION AND FEEDBACK
    // ---------------------------------------
    
    // Calculate the final score as a weighted combination of all approaches
    let finalScore = (
      semanticSimilarity * 0.4 +
      conceptualUnderstandingScore * 0.4 +
      (isMultiPartAnswer ? 
        partialScores.reduce((sum, part) => sum + part.score, 0) / partialScores.length * 0.2 : 
        semanticSimilarity * 0.2)
    );
    
    console.log(`Final score: ${Math.round(finalScore * 100)}%`);
    
    // Check if the correct answer is a generic placeholder
    const isGenericAnswer = normalizedCorrectAnswer.includes('important concept') && 
                           normalizedCorrectAnswer.includes('insurance exam') &&
                           normalizedCorrectAnswer.includes('understanding key principles');
    
    console.log('Is correct answer a generic placeholder?', isGenericAnswer);
    
    // If the correct answer is generic, use a more lenient evaluation based on domain knowledge
    if (isGenericAnswer) {
      // Extract the topic from the question (e.g., "Property Insurance" from "What is Property Insurance?")
      const topicMatch = question.match(/What is ([^?]+)\??/);
      let topicName = topicMatch ? topicMatch[1].toLowerCase().trim() : '';
      console.log(`Topic extracted from question: "${topicName}"`);
      
      // Define topic-specific terminology
      const topicTerms = {};
      
      // Underwriting specific terms
      topicTerms['underwriting'] = [
        'risk', 'assessment', 'evaluation', 'application', 'approval', 'decline', 'accept',
        'policy', 'premium', 'rate', 'insurer', 'company', 'analyze', 'determine', 'eligibility',
        'process', 'qualification', 'review', 'standards', 'guidelines', 'criteria'
      ];
      
      // Property Insurance specific terms
      topicTerms['property insurance'] = [
        'building', 'structure', 'dwelling', 'real estate', 'personal property', 'belongings',
        'damage', 'loss', 'theft', 'fire', 'flood', 'coverage', 'protection', 'replacement',
        'value', 'deductible', 'premium', 'claim', 'peril', 'hazard'
      ];
      
      // Policy Provisions specific terms
      topicTerms['policy provisions'] = [
        'clause', 'condition', 'term', 'exclusion', 'limitation', 'endorsement', 'rider',
        'coverage', 'requirement', 'obligation', 'statement', 'declaration', 'section',
        'agreement', 'contract', 'document', 'stipulation', 'specification'
      ];
      
      // Risk Management specific terms
      topicTerms['risk management'] = [
        'identify', 'assessment', 'evaluation', 'mitigation', 'transfer', 'avoidance',
        'reduction', 'control', 'strategy', 'plan', 'analysis', 'prevention', 'minimize',
        'monitor', 'handle', 'process', 'approach', 'technique'
      ];
      
      // General insurance terms that apply to all topics
      const generalInsuranceTerms = [
        'insurance', 'policy', 'coverage', 'premium', 'deductible', 'claim', 'loss', 'damage',
        'liability', 'protection', 'risk', 'peril', 'hazard', 'indemnity', 'insured', 'insurer',
        'benefit', 'compensation', 'contract', 'agreement', 'underwriter', 'agent', 'broker'
      ];
      
      // Find the most relevant topic terms
      let relevantTopicTerms = [];
      let bestMatchTopic = '';
      
      // First check for exact topic match
      if (topicTerms[topicName]) {
        relevantTopicTerms = topicTerms[topicName];
        bestMatchTopic = topicName;
      } else {
        // If no exact match, look for partial matches
        for (const topic in topicTerms) {
          if (topicName.includes(topic) || topic.includes(topicName)) {
            relevantTopicTerms = topicTerms[topic];
            bestMatchTopic = topic;
            break;
          }
        }
      }
      
      console.log(`Best matching topic: "${bestMatchTopic}"`);
      
      // Combine relevant topic terms with general insurance terms
      const allRelevantTerms = [...new Set([...relevantTopicTerms, ...generalInsuranceTerms])];
      
      // Check if user's answer contains the topic name and domain-specific terminology
      const containsTopicName = normalizedUserAnswer.includes(topicName);
      
      // Check for domain terms in user answer
      const matchedTerms = allRelevantTerms.filter(term => normalizedUserAnswer.includes(term));
      
      // Also check for synonyms of domain terms
      for (const term of allRelevantTerms) {
        if (synonymsMap[term]) {
          for (const synonym of synonymsMap[term]) {
            if (normalizedUserAnswer.includes(synonym) && !matchedTerms.includes(term)) {
              matchedTerms.push(`${term} (via synonym: ${synonym})`);
            }
          }
        }
      }
      
      // Consider answer to have domain knowledge if it contains topic-specific terms
      const hasDomainTerms = matchedTerms.length >= 2; // At least 2 relevant terms
      
      console.log(`Topic "${topicName}" ${containsTopicName ? 'found' : 'not found'} in answer`);
      console.log(`Domain terms found (${matchedTerms.length}): ${matchedTerms.join(', ')}`);
      
      // For generic answers, consider the answer correct if it contains domain knowledge
      if (hasDomainTerms) {
        console.log('Answer contains sufficient domain knowledge for generic question');
        finalScore = Math.max(finalScore, 0.85); // Boost score to at least 85%
        
        // If answer is particularly good (contains many domain terms or explains the concept well)
        if (matchedTerms.length >= 4 || conceptualUnderstandingScore > 0.7) {
          console.log('Answer demonstrates strong domain knowledge');
          finalScore = Math.max(finalScore, 0.95); // Boost score to excellent
        }
      }
    }
    
    // Calculate direct string similarity as a lightweight alternative to embeddings
    const directSimilarity = stringSimilarity.compareTwoStrings(normalizedUserAnswer, normalizedCorrectAnswer);
    console.log(`Direct string similarity: ${Math.round(directSimilarity * 100)}%`);
    
    // Calculate word overlap similarity (Jaccard similarity)
    const userWords = normalizedUserAnswer.split(' ').filter(w => w.length > 2);
    const correctWords = normalizedCorrectAnswer.split(' ').filter(w => w.length > 2);
    const uniqueUserWords = new Set(userWords);
    const uniqueCorrectWords = new Set(correctWords);
    
    // Calculate intersection size
    let intersectionSize = 0;
    for (const word of uniqueUserWords) {
      if (uniqueCorrectWords.has(word)) {
        intersectionSize++;
      } else {
        // Check if any synonym matches
        for (const correctWord of uniqueCorrectWords) {
          if (synonymsMap[correctWord] && synonymsMap[correctWord].includes(word)) {
            intersectionSize++;
            break;
          } else if (synonymsMap[word] && synonymsMap[word].includes(correctWord)) {
            intersectionSize++;
            break;
          }
        }
      }
    }
    
    const unionSize = uniqueUserWords.size + uniqueCorrectWords.size - intersectionSize;
    const jaccardSimilarity = unionSize > 0 ? intersectionSize / unionSize : 0;
    console.log(`Jaccard similarity with synonyms: ${Math.round(jaccardSimilarity * 100)}%`);
    
    // Reweight the final score with our new metrics
    const reweightedScore = (
      semanticSimilarity * 0.25 +
      conceptualUnderstandingScore * 0.25 +
      (isMultiPartAnswer
        ? partialScores.reduce((sum, part) => sum + part.score, 0) / partialScores.length * 0.15
        : semanticSimilarity * 0.15) +
      directSimilarity * 0.15 +
      jaccardSimilarity * 0.2
    );
    console.log(`Reweighted final score: ${Math.round(reweightedScore * 100)}%`);
    finalScore = reweightedScore;
    
    // Determine correctness based on the final score
    // 80-100%: Correct
    // 60-79%: Partially Correct
    // Below 60%: Incorrect
    let correctnessLevel = '';
    if (finalScore >= 0.8) {
      correctnessLevel = 'correct';
    } else if (finalScore >= 0.6) {
      correctnessLevel = 'partially_correct';
    } else {
      correctnessLevel = 'incorrect';
    }
    
    console.log(`Answer evaluation result: ${correctnessLevel.toUpperCase()} (${Math.round(finalScore * 100)}%)`);
    
    // Generate detailed feedback based on the evaluation
    let feedbackText = '';
    
    if (correctnessLevel === 'correct') {
      feedbackText = "Correct! Well done.";
      if (finalScore < 0.9) {
        feedbackText += " Your answer captures the key concepts accurately.";
      }
      setIsCorrect(true);
      onCorrect && onCorrect();
    } 
    else if (correctnessLevel === 'partially_correct') {
      // For partially correct answers, provide specific feedback on what was correct/incorrect
      feedbackText = "Partially correct. ";
      
      // For generic answers, provide more helpful feedback
      if (isGenericAnswer) {
        feedbackText = "Your answer shows understanding, but could be more complete. ";
        
        // Extract the topic from the question
        const topicMatch = question.match(/What is ([^?]+)\??/);
        const topicName = topicMatch ? topicMatch[1] : 'this concept';
        
        // Add some domain-specific feedback
        if (question.toLowerCase().includes('underwriting')) {
          feedbackText += `${topicName} involves evaluating risks to determine whether to issue a policy and at what premium rate. `;
        } else if (question.toLowerCase().includes('property insurance')) {
          feedbackText += `${topicName} protects against loss or damage to property and possessions. `;
        } else if (question.toLowerCase().includes('policy provisions')) {
          feedbackText += `${topicName} are the terms, conditions, and clauses that define coverage in an insurance contract. `;
        } else if (question.toLowerCase().includes('risk management')) {
          feedbackText += `${topicName} involves identifying, assessing, and prioritizing risks followed by coordinated application of resources to minimize impact. `;
        } else {
          feedbackText += `Try to include more specific details about ${topicName}. `;
        }
      } else {
        // Add feedback about what was correct for non-generic answers
        const strongestAspect = Math.max(semanticSimilarity, conceptualUnderstandingScore);
        if (strongestAspect === semanticSimilarity && semanticSimilarity > 0.7) {
          feedbackText += "You understood the general meaning well. ";
        } else if (strongestAspect === conceptualUnderstandingScore && conceptualUnderstandingScore > 0.7) {
          feedbackText += "You demonstrated good conceptual understanding. ";
        }
      }
      
      // Add feedback about what was missing
      if (isMultiPartAnswer) {
        // Identify which parts were missing or weak
        const weakParts = partialScores.filter(part => part.score < 0.6)
          .map((part, idx) => `Part ${idx + 1}`);
        
        if (weakParts.length > 0) {
          feedbackText += `You could improve on: ${weakParts.join(', ')}. `;
        }
      } else if (semanticSimilarity < 0.6) {
        feedbackText += "Your answer could be more precise. ";
      } else if (conceptualUnderstandingScore < 0.6) {
        feedbackText += "Try to include more key concepts in your answer. ";
      }
      
      feedbackText += `\n\nThe complete answer is: ${answer}`;
      
      // For partially correct, we'll still count it as correct for scoring purposes
      // but provide detailed feedback
      setIsCorrect(true);
      onCorrect && onCorrect();
    } 
    else {
      // For incorrect answers, provide helpful guidance
      feedbackText = "Not quite correct. ";
      
      // Add specific feedback based on what was missing
      if (semanticSimilarity < 0.3) {
        feedbackText += "Your answer is missing the core meaning. ";
      } else if (conceptualUnderstandingScore < 0.3) {
        feedbackText += "Your answer is missing key concepts. ";
      } else {
        feedbackText += "Your answer is on the right track but incomplete. ";
      }
      
      feedbackText += `\n\nThe correct answer is: ${answer}`;
      
      setIsCorrect(false);
      onIncorrect && onIncorrect();
    }
    
    // Show the answer
    setShowAnswer(true);
    
    setFeedback(feedbackText);
    
    // Speak the feedback based on correctness level
    if (correctnessLevel === 'correct') {
      speak("Correct! Well done.");
    } else if (correctnessLevel === 'partially_correct') {
      speak("Partially correct. Here's the complete answer.");
    } else {
      speak(`Not quite correct. The answer is: ${answer}`);
    }
  };
  
  // Handle next card
  const handleNext = () => {
    onNext && onNext();
  };
  
  return (
    <div className="voice-flashcard card p-6 flex flex-col">
      {/* Question Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Question</h3>
          <VoiceOutput text={question} className="ml-2" />
        </div>
        <p className="text-gray-700 dark:text-gray-300">{question}</p>
      </div>
      
      {/* User Answer Section */}
      {!showAnswer ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Answer</h3>
          <VoiceInput 
            onTranscriptReady={handleTranscriptReady} 
            placeholder="Click the microphone and speak your answer..."
          />
          
          <div className="flex justify-between mt-4">
            <button 
              className="btn-secondary"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
            
            {isListening ? (
              <div className="flex gap-2">
                <button 
                  className="btn-danger animate-pulse"
                  onClick={() => {
                    stopListening();
                    if (transcript) {
                      console.log('Manually submitting transcript:', transcript);
                      handleTranscriptReady(transcript);
                    }
                  }}
                >
                  Stop & Submit
                </button>
              </div>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleListenForAnswer}
              >
                Speak Answer
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* User's Answer Display */}
          {userAnswer && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Answer</h3>
              <div className={`p-3 rounded-md ${
                isCorrect 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {userAnswer}
              </div>
            </div>
          )}
          
          {/* Correct Answer Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Correct Answer</h3>
              <VoiceOutput text={dynamicAnswer || answer} className="ml-2" />
            </div>
            <div className="p-3 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
              {dynamicAnswer || answer}
              
              {keyPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                  <h4 className="font-medium mb-2">Key Points:</h4>
                  <ul className="list-disc pl-5">
                    {keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Feedback */}
          {feedback && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Feedback</h3>
              <div className={`p-3 rounded-md ${
                isCorrect 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {feedback}
              </div>
            </div>
          )}
          
          {/* Next Button */}
          <div className="mt-auto">
            <button 
              className="w-full btn-primary"
              onClick={handleNext}
            >
              Next Card
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceFlashcard;

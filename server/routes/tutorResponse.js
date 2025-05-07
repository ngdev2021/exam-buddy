import express from "express";
import OpenAI from "openai";

const router = express.Router();

// POST /api/tutor-response
router.post("/", async (req, res) => {
  const { subject, topic, question, history = [] } = req.body;
  
  if (!subject || !topic || !question) {
    return res.status(400).json({ 
      error: "Missing required parameters. Please provide subject, topic, and question." 
    });
  }
  
  // Format history for the OpenAI API if provided
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Create a well-structured prompt for the tutor response
    const prompt = `You are a trusted friend and mentor who happens to be an expert in ${subject}, particularly ${topic}. You're having a casual, honest conversation with someone you genuinely care about and have built trust with over time.

You speak naturally and conversationally, just like a real person would. You use a warm, friendly tone and occasionally use casual language, contractions, and even a touch of humor when appropriate. You're supportive, encouraging, and never judgmental.

When your friend asks you a question:
1. Answer it directly and honestly, just like you would in a real conversation
2. If it's a factual question (like "what is 2+2"), give the straightforward answer first ("It's 4") before adding context
3. If they're struggling with a concept, show empathy and offer practical advice
4. Share personal-sounding insights or examples that make concepts easier to understand
5. Ask follow-up questions when it would help clarify their needs

You're not just a source of information - you're a trusted companion on their learning journey. You care about their success and well-being.

Your friend has asked: "${question}"

Respond naturally, as if you're having a real conversation:`;

    // Create the messages array with system prompt and conversation history
    const messages = [
      { role: "system", content: prompt }
    ];
    
    // Add conversation history if available
    if (formattedHistory.length > 0) {
      messages.push(...formattedHistory);
    }
    
    // Add the current question
    messages.push({ role: "user", content: question });
    
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-4 for better responses if available
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract the response text
    const responseText = completion.choices[0].message.content.trim();
    
    // Extract key points from the response
    const keyPoints = extractKeyPoints(responseText);

    // Return the response
    res.json({
      answer: responseText,
      keyPoints: keyPoints
    });
  } catch (err) {
    console.error("Error generating tutor response:", err);
    res.status(500).json({ 
      error: "Failed to generate tutor response.", 
      details: err.message 
    });
  }
});

/**
 * Extract key points from an AI-generated answer
 * @param {string} answer - The full answer text
 * @returns {string[]} - Array of extracted key points
 */
function extractKeyPoints(answer) {
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
}


export default router;

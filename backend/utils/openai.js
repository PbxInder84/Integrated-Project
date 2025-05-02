const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();


// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat'; // Default DeepSeek model

// Simple in-memory cache
const analysisCache = new Map();

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute window - DeepSeek typically has better rate limits
  maxRequests: 5,       // Max 5 requests per minute - adjust based on your DeepSeek plan
  requestTimestamps: []
};

/**
 * Check if we can make a new API request based on rate limits
 * @returns {boolean} - Whether the request is allowed
 */
function checkRateLimit() {
  const now = Date.now();
  
  // Remove timestamps outside the current window
  rateLimitConfig.requestTimestamps = rateLimitConfig.requestTimestamps.filter(
    timestamp => now - timestamp < rateLimitConfig.windowMs
  );
  
  // Check if we've exceeded the max requests for this window
  if (rateLimitConfig.requestTimestamps.length >= rateLimitConfig.maxRequests) {
    return false;
  }
  
  // Add current timestamp and allow the request
  rateLimitConfig.requestTimestamps.push(now);
  return true;
}

/**
 * Get cached analysis result for a resume
 * @param {string} resumeId - Resume ID 
 * @returns {Object|null} - Cached analysis or null if not found
 */
function getCachedAnalysis(resumeId) {
  if (analysisCache.has(resumeId)) {
    const cachedResult = analysisCache.get(resumeId);
    // Cache valid for 24 hours
    if (Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000) {
      console.log('Using cached AI analysis for resume:', resumeId);
      return cachedResult.data;
    }
    // Remove stale cache
    analysisCache.delete(resumeId);
  }
  return null;
}

/**
 * Store analysis result in cache
 * @param {string} resumeId - Resume ID
 * @param {Object} analysisData - Analysis data to cache
 */
function cacheAnalysisResult(resumeId, analysisData) {
  analysisCache.set(resumeId, {
    data: analysisData,
    timestamp: Date.now()
  });
  console.log('Cached AI analysis for resume:', resumeId);
}

/**
 * Create a prompt for DeepSeek API
 * @param {Object} resumeData - Resume data
 * @returns {string} - Formatted prompt
 */
function createResumePrompt(resumeData) {
  const { parsedContent } = resumeData;
  
  // Extract resume data
  const name = parsedContent.name || 'Not provided';
  const email = parsedContent.email || 'Not provided';
  const phone = parsedContent.phone || 'Not provided';
  
  const skills = parsedContent.skills && parsedContent.skills.length > 0 
    ? parsedContent.skills.join(', ') 
    : 'Not provided';
  
  const education = parsedContent.education && parsedContent.education.length > 0 
    ? parsedContent.education.join('\n') 
    : 'Not provided';
  
  return `
Resume Information:
Name: ${name}
Email: ${email}
Phone: ${phone}

Education:
${education}

Skills:
${skills}

Please analyze this resume and provide feedback in the following JSON format:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "targetRoles": ["role1", "role2", "role3"],
  "overallFeedback": "Detailed overall feedback paragraph",
  "keywordMatch": 70,
  "readabilityScore": 75
}
`;
}

/**
 * Analyze resume content using DeepSeek API
 * @param {Object} resumeData - Parsed resume data
 * @returns {Object} - AI analysis results
 */
async function analyzeResumeWithAI(resumeData) {
  try {
    // Check cache first
    const resumeId = resumeData.id;
    const cachedResult = getCachedAnalysis(resumeId);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }
    
    // Get API key from environment variables
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    console.log('DeepSeek API Key available:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured in environment variables.');
    }

    // Create prompt for DeepSeek API
    const prompt = createResumePrompt(resumeData);
    
    // Make API request
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume reviewer who provides detailed feedback on resumes. Your task is to analyze resume data and provide structured feedback in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Parse DeepSeek response
    const aiResponse = response.data.choices[0].message.content;
    const parsedResponse = parseAIResponse(aiResponse);
    
    // Cache the result
    cacheAnalysisResult(resumeId, parsedResponse);
    
    return parsedResponse;
  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    
    // Provide more detailed error messages based on error code
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        throw new Error('DeepSeek API rate limit exceeded. Please try again later.');
      } else if (status === 401) {
        throw new Error('Invalid DeepSeek API key. Please check your API key and try again.');
      } else if (status === 403) {
        throw new Error('DeepSeek API access forbidden. Your account may require verification.');
      } else {
        throw new Error(`DeepSeek API error (${status}): ${error.response.data?.error?.message || error.message}`);
      }
    }
    
    throw new Error(`Failed to analyze with AI: ${error.message}`);
  }
}

/**
 * Parse AI response into structured data
 * @param {String} aiResponse - Raw AI response
 * @returns {Object} - Structured analysis data
 */
function parseAIResponse(aiResponse) {
  try {
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Ensure all required fields exist
      const result = {
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        suggestions: parsed.suggestions || [],
        targetRoles: parsed.targetRoles || [],
        overallFeedback: parsed.overallFeedback || "No detailed feedback available.",
        keywordMatch: parsed.keywordMatch || 70,
        readabilityScore: parsed.readabilityScore || 75
      };
      
      return result;
    }
    
    // Fallback if JSON parsing fails
    throw new Error('Failed to parse AI response as JSON');
  } catch (error) {
    console.error('AI Response Parsing Error:', error.message);
    throw new Error('Failed to parse AI response: ' + error.message);
  }
}

module.exports = {
  analyzeResumeWithAI
}; 
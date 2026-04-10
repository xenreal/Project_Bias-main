import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

/**
 * Initialize the Gemini client
 */
export function initGemini(apiKey) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'Gemini API key not found. Set VITE_GEMINI_API_KEY in your .env file.'
    );
  }
  genAI = new GoogleGenerativeAI(key);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  return model;
}

function getModel() {
  if (!model) {
    initGemini();
  }
  return model;
}

/**
 * Build the system prompt for bias analysis
 */
function buildAnalysisPrompt(fileData, userContext) {
  const goal = userContext || "General Pattern Recognition";

  return `You are a Universal AI Data Integrity & Ethics Auditor.
USER DEFINED GOAL: "${goal}"

Your task is to analyze the provided dataset for three specific layers of risk:

## LAYER 1: GOAL-DATA ALIGNMENT (RELEVANCE)
- Compare the "Goal" to the "Features" in the data.
- If the data contains categories that have nothing to do with the goal (e.g., Physical Ed data for a Math goal), flag as "SCOPE CONTAMINATION".
- SUGGESTION: "FILTER: Remove [Category] to focus the model on [Goal]."

## LAYER 2: MERIT VS. BIAS (CALIBRATION)
- Distinguish between "Functional Requirements" and "Protected Attributes".
- If the Goal is "Senior Roles", do NOT flag a preference for "Experience" as a bias. This is Merit-Based.
- CRITICAL: Only flag "CRITICAL BIAS" if you find disparities WITHIN the target group (e.g., if the goal is Senior Hiring, but Senior Women are rejected more than Senior Men).

## LAYER 3: INCLUSION-DRIVEN MITIGATION
- **NEVER** suggest "Dropping" a protected attribute column (Age, Gender, Race) if it is needed for auditing.
- ALWAYS prioritize "AUGMENTATION". If a specific demographic is missing or failing, suggest: "AUGMENT: Add [X] samples of [Group] who have [Successful Outcome] to balance the training set."

## LAYER 4: PROXY & LABEL INTEGRITY
- Check if "Zip Code", "University Name", or "Hobbies" are acting as hidden proxies for Race or Class.
- Interpret 0% success rates: "The success labels for [Group] show total exclusion; this suggests historical human bias in the Ground Truth."

## OUTPUT FORMAT (STRICT JSON)
{
  "bias_score": <0-100>,
  "primary_bias_type": "<string>",
  "data_integrity": "<Matched | Contaminated | Mismatched>",
  "summary": "<1-sentence summary of the data's readiness for the goal>",
  "detailed_findings": [
    {
      "category": "<Relevance | Fairness | Proxy>",
      "description": "<detailed text>",
      "severity": "<low|medium|high|critical>",
      "affected_groups": ["<group names>"]
    }
  ],
  "recommendations": [
    "AUGMENT: <What to add>",
    "FILTER: <What to remove>",
    "RECALIBRATE: <How to fix the scoring logic>"
  ]
}`;
}

/**
 * Analyze a file for bias using Gemini
 */
export async function analyzeBias(fileData, userContext) {
  const m = getModel();
  const prompt = buildAnalysisPrompt(fileData, userContext);

  let parts;
  if (fileData.type === 'image') {
    parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.content, // base64
        },
      },
    ];
  } else {
    // For data files, include the content as text
    const dataSnippet =
      fileData.content.length > 30000
        ? fileData.content.slice(0, 30000) + '\n\n[...truncated for length]'
        : fileData.content;
    parts = [{ text: `${prompt}\n\n## DATA CONTENT:\n${dataSnippet}` }];
  }

  const result = await m.generateContent(parts);
  const text = result.response.text();

  // Parse JSON from response (handle possible markdown code fences)
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If parsing fails, return a structured error response
    return {
      bias_score: -1,
      primary_bias_type: 'Analysis Error',
      file_type: fileData.type,
      summary: 'Failed to parse AI response. Raw output attached.',
      detailed_findings: [
        {
          category: 'Parse Error',
          description: text,
          severity: 'low',
          affected_groups: [],
        },
      ],
      metrics: {},
      recommendations: ['Try re-running the analysis.'],
    };
  }
}

/**
 * Generate mitigation suggestions via a follow-up Gemini call
 */
export async function generateMitigation(analysisResult, fileData) {
  const m = getModel();

  let prompt;
  if (fileData.type === 'data') {
    prompt = `You are an AI Bias Mitigation Expert. Based on the following bias analysis results, generate synthetic data to help balance the dataset.

## ANALYSIS RESULTS:
${JSON.stringify(analysisResult, null, 2)}

## TASK:
Generate exactly 20 rows of synthetic JSON data designed to balance the biased categories identified in the analysis. The data should:
1. Follow the same schema/columns as the original dataset
2. Specifically counter-balance the identified biases
3. Be realistic and plausible

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "mitigation_type": "synthetic_data",
  "description": "<explanation of what was generated and why>",
  "synthetic_data": [ { ...row1 }, { ...row2 }, ... ],
  "expected_improvement": "<how this data would reduce bias>",
  "new_estimated_bias_score": <number 0-100>
}`;
  } else {
    prompt = `You are an AI Bias Mitigation Expert. Based on the following bias analysis of an image dataset, suggest corrective image prompts.

## ANALYSIS RESULTS:
${JSON.stringify(analysisResult, null, 2)}

## TASK:
Describe exactly 10 specific, detailed image prompts that would balance this dataset's diversity. Each prompt should:
1. Counter a specific bias identified in the analysis
2. Be detailed enough for an AI image generator (include setting, lighting, style)
3. Directly address representation gaps

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "mitigation_type": "image_prompts",
  "description": "<explanation of the strategy>",
  "image_prompts": [
    {
      "prompt": "<detailed image generation prompt>",
      "addresses_bias": "<which bias this counters>",
      "target_demographic": "<who/what this adds representation for>"
    }
  ],
  "expected_improvement": "<how these images would reduce bias>",
  "new_estimated_bias_score": <number 0-100>
}`;
  }

  const result = await m.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      mitigation_type: 'error',
      description: 'Failed to parse mitigation response.',
      raw_response: text,
    };
  }
}

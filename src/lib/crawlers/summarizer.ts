/**
 * AI-powered news summarization
 */

import OpenAI from 'openai';
import { loggers } from '../logger';

const log = loggers.ai;

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client
 */
function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

/**
 * Summarize news article using OpenAI
 */
export async function summarizeWithOpenAI(
  title: string,
  content: string
): Promise<string> {
  const client = getOpenAIClient();

  if (!client || !content || content.length < 50) {
    return content.substring(0, 200) || title;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '당신은 금융 뉴스 요약 전문가입니다. 주어진 증권사 관련 뉴스를 2-3문장으로 핵심만 요약해주세요. 한국어로 작성하세요.',
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n본문:\n${content}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content;
    if (summary) {
      log.debug({ titlePreview: title.substring(0, 30) }, 'Summary generated');
      return summary;
    }

    return content.substring(0, 200);
  } catch (error) {
    log.error({ error }, 'OpenAI summarization failed');
    return content.substring(0, 200) || title;
  }
}

/**
 * Check if AI summarization is available
 */
export function isAiSummarizationAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

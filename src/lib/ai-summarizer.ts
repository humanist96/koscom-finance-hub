import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function summarizeNews(title: string, content: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using content truncation');
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `다음 증권사 관련 뉴스 기사를 2-3문장으로 핵심만 요약해주세요. 요약만 작성하고 다른 설명은 하지 마세요.

제목: ${title}

본문:
${content.substring(0, 2000)}`,
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text.trim();
    }
    return content.substring(0, 200);
  } catch (error) {
    console.error('AI summarization error:', error);
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }
}

export async function classifyNewsWithAI(title: string, content: string): Promise<{
  category: string;
  isPersonnel: boolean;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { category: 'GENERAL', isPersonnel: false };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `다음 뉴스를 분류해주세요.

제목: ${title}
본문 일부: ${content.substring(0, 500)}

카테고리 중 하나를 선택: PERSONNEL(인사), BUSINESS(실적/경영), PRODUCT(상품/서비스), IR(공시/투자), EVENT(행사), GENERAL(일반)

JSON 형식으로만 응답: {"category": "카테고리", "isPersonnel": true/false}`,
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      const parsed = JSON.parse(textBlock.text.trim());
      return {
        category: parsed.category || 'GENERAL',
        isPersonnel: parsed.isPersonnel || false,
      };
    }
    return { category: 'GENERAL', isPersonnel: false };
  } catch {
    return { category: 'GENERAL', isPersonnel: false };
  }
}

import OpenAI from 'openai';

import prisma from '@/lib/prisma';
import { symmetricDecrypt } from '@/lib/encryption';
import { ExtractDataWithAiTask } from '../task/extract-data-with-ai';
import { ExecutionEnvironment } from '@/types/executor';

import * as cheerio from 'cheerio';

export async function ExtractDataWithAiExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAiTask>
): Promise<boolean> {
  try {
    const credentials = environment.getInput('Credentials');
    if (!credentials) {
      environment.log.error('input->credentials not defined');
      return false; 
    }

    const prompt = environment.getInput('Prompt');
    if (!prompt) {
      environment.log.error('input->prompt not defined');
      return false; 
    }

    const content = environment.getInput('Content');
    if (!content) {
      environment.log.error('input->content not defined');
      return false; 
    }

    const credential = await prisma.credential.findUnique({
      where: { id: credentials },
    });
    if (!credential) {
      environment.log.error('credential not found');
      return false;
    }

    const plainCredentialValue = symmetricDecrypt(credential.value);
    if (!plainCredentialValue) {
      environment.log.error('cannot decrypt credential');
      return false;
    }

    const groq = new OpenAI({ 
      apiKey: plainCredentialValue,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const systemPrompt = `
      You are a webscraper helper that extracts data from HTML or text.
      You will be given a piece of text or HTML content as input and also a prompt with what data to extract.
      The response must be exactly one valid JSON object containing the extracted data.
      Do not add any additional text, markdown, or multiple JSON objects.
      If no data is found, return an empty JSON object {}.
    `;

    // Clean HTML to drastically reduce token count
    let cleanContent = content;
    try {
      const $ = cheerio.load(content);
      $('script, style, svg, noscript, meta, link, iframe').remove();
      cleanContent = $('body').html() || content;
      // Groq free tier limit is strictly 6000 tokens. 
      // 12000 characters is a safe bet to stay under ~5000 tokens.
      if (cleanContent.length > 12000) {
        cleanContent = cleanContent.substring(0, 12000);
      }
    } catch (e) {
      if (cleanContent.length > 12000) {
        cleanContent = cleanContent.substring(0, 12000);
      }
    }

    const fullPrompt = `Content:\n${cleanContent}\n\nPrompt:\n${prompt}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    let resultText = response.choices[0]?.message?.content;

    if (!resultText) {
      environment.log.error('Empty response from Groq');
      return false;
    }

    // Clean up markdown formatting from the AI response
    resultText = resultText.trim();
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```[a-zA-Z]*\n?/, '');
      resultText = resultText.replace(/```$/, '').trim();
    }

    environment.setOutput('Extracted data', resultText); 

    return true;
  } catch (error: any) {
    environment.log.error(error.message || error);
    return false;
  }
}

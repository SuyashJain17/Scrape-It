import { GoogleGenerativeAI } from '@google/generative-ai';

import {prisma} from '@/lib/prisma';
import { symmetricDecrypt } from '@/lib/encryption';
import { ExtractDataWithAiTask } from '../task/ExtractDataWithAi';
import { ExecutionEnvironment } from '@/types/executor';

export async function ExtractDataWithAiExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAiTask>
): Promise<boolean> {
  try {
    const credentials = environment.getInput('Credentials');
    if (!credentials) {
      environment.log.error('input->credentials not defined');
    }

    const prompt = environment.getInput('Prompt');
    if (!prompt) {
      environment.log.error('input->prompt not defined');
    }

    const content = environment.getInput('Content');
    if (!content) {
      environment.log.error('input->content not defined');
    }

    // Get credentials from DB
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

    const genAI = new GoogleGenerativeAI(plainCredentialValue);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemPrompt = `
        You are a webscraper helper that extracts data from HTML or text.
        You will be given a piece of text or HTML content as input and also a prompt with what data to extract.
        The response should always be ONLY the extracted data as a JSON array or object, with no additional text or explanation.
        If no data is found, return an empty JSON array [].
        `;

    const fullPrompt = `${systemPrompt}\n\nContent:\n${content}\n\nPrompt:\n${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });

    const response = result.response.text();

    if (!response) {
      environment.log.error('Empty response from Gemini');
      return false;
    }

    environment.setOutput('Extracted data', response);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}

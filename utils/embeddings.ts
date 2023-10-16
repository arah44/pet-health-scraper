
import OpenAI from 'openai';

const openai = new OpenAI();

export async function getEmbeddings(input: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, ' ')
    })

    return response.data[0].embedding as number[]

  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e, JSON.stringify(e));
    throw new Error(`Error calling OpenAI embedding API: ${e} ${JSON.stringify(e)}`);
  }
}
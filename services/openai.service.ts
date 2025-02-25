import { openai, MODEL } from "@/infrastructure/openAI";
import { File } from "@/model/context";

const decodeBase64 = (text: string) => {
  return atob(text);
};

const answerContextQuestions = async (files: File[], questions: string[]) => {
  const answerPromises = files.map(async (file) => {
    const answer = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Answer the questions provided by the users based on the following text and return the answer in a JSON object using the question text as the key, the answer for each question must be a string: \n" +
            Buffer.from(file.contents, "base64"),
        },
        {
          role: "user",
          content: questions.join("\n"),
        },
      ],
    });
    return JSON.parse(answer.choices[0].message.content as string);
  });

  return Promise.all(answerPromises) as Promise<Record<string, string>[]>;
};

const contextSystemPropmt = (context: string[]) =>
  openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          `You are a helpful chat assistant who helps our UX team query video transcripts that are user interviews. \n` +
          `Answer the question based on the context below. \n` +
          context.join(`\n`) +
          `You must follow this rules: \n` +
          `Do not answer if the if the solution is not provided in the context and politely ask them a question related to the product.\n`,
      },
    ],
  });

export const openAIService = {
  answerContextQuestions,
  contextSystemPropmt,
};

// Add module declaration for node-nlp
declare module 'node-nlp' {
  export class NlpManager {
    constructor(options: { languages: string[] });
    addDocument(language: string, text: string, intent: string): void;
    addAnswer(language: string, intent: string, answer: string): void;
    train(): Promise<void>;
    process(language: string, text: string): Promise<{
      intent: string;
      score: number;
      answer?: string;
    }>;
  }
}
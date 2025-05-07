import { NlpManager } from "node-nlp";

export class NLPManager {
  private manager: NlpManager;
  private initialized: boolean = false;

  constructor() {
    this.manager = new NlpManager({ languages: ['en'] });
  }

  async initialize(): Promise<void> {
    // Add documents for training
    this.addTrainingData();
    
    // Train the model
    await this.manager.train();
    
    this.initialized = true;
    console.log('NLP Manager initialized and trained');
  }

  private addTrainingData(): void {
    // Product inquiries
    this.manager.addDocument('en', 'What products do you offer', 'product.inquiry');
    this.manager.addDocument('en', 'Tell me about your products', 'product.inquiry');
    this.manager.addDocument('en', 'What solutions do you provide', 'product.inquiry');
    this.manager.addDocument('en', 'Do you have software solutions', 'product.inquiry');
    
    // Service inquiries
    this.manager.addDocument('en', 'What services do you provide', 'service.inquiry');
    this.manager.addDocument('en', 'Tell me about your services', 'service.inquiry');
    this.manager.addDocument('en', 'Do you offer consulting', 'service.inquiry');
    this.manager.addDocument('en', 'Can you help with implementation', 'service.inquiry');
    
    // Pricing inquiries
    this.manager.addDocument('en', 'How much does it cost', 'pricing.inquiry');
    this.manager.addDocument('en', 'What are your prices', 'pricing.inquiry');
    this.manager.addDocument('en', 'Pricing information', 'pricing.inquiry');
    this.manager.addDocument('en', 'How much for your services', 'pricing.inquiry');
    
    // Support inquiries
    this.manager.addDocument('en', 'I need help with your product', 'support.inquiry');
    this.manager.addDocument('en', 'Technical support', 'support.inquiry');
    this.manager.addDocument('en', 'Something is not working', 'support.inquiry');
    this.manager.addDocument('en', 'Having issues with the software', 'support.inquiry');
    
    // Contact inquiries
    this.manager.addDocument('en', 'How can I contact you', 'contact.inquiry');
    this.manager.addDocument('en', 'Contact information', 'contact.inquiry');
    this.manager.addDocument('en', 'Email address', 'contact.inquiry');
    this.manager.addDocument('en', 'Phone number', 'contact.inquiry');
    
    // Add answers for each intent
    this.manager.addAnswer('en', 'product.inquiry', 'We offer a range of enterprise software solutions including network security packages, cloud storage, and data analytics tools. Our sales team would be happy to provide you with more details.');
    
    this.manager.addAnswer('en', 'service.inquiry', 'Our services include software implementation, IT consulting, managed services, and technical support. We tailor our offerings to meet your specific business needs.');
    
    this.manager.addAnswer('en', 'pricing.inquiry', 'Our pricing varies based on the specific products and services you require. A member of our sales team will contact you shortly to provide a customized quote based on your needs.');
    
    this.manager.addAnswer('en', 'support.inquiry', 'We\'re sorry to hear you\'re experiencing issues. Our technical support team will contact you shortly to help resolve your problem. In the meantime, you can check our online documentation at support.iwb.com.');
    
    this.manager.addAnswer('en', 'contact.inquiry', 'You can reach our sales team at sales@iwb.com or call us at +1-800-IWB-HELP. Our office hours are Monday to Friday, 9 AM to 5 PM EST.');
  }

  async generateResponse(message: string): Promise<string | undefined> {
    if (!this.initialized) {
      throw new Error('NLP Manager not initialized');
    }
    
    try {
      // Process the message and get the best match
      const result = await this.manager.process('en', message);
      
      // If confidence is high enough, return the answer
      if (result.intent && result.score > 0.7) {
        return result.answer;
      }
      
      // If confidence is not high enough, return undefined
      // This will be handled by setting the query as pending for manual response
      return undefined;
    } catch (error) {
      console.error('Error generating response:', error);
      return undefined;
    }
  }
}

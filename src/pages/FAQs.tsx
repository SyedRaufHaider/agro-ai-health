import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const faqs = [
    {
      question: "What is Agro AI?",
      answer: "Agro AI is an advanced AI-powered platform that helps farmers and gardeners detect plant diseases through image analysis. Simply take a photo of your plant, and our AI will identify any diseases and recommend appropriate treatments."
    },
    {
      question: "How accurate is the disease detection?",
      answer: "Our AI model has been trained on thousands of plant disease images and achieves an accuracy rate of over 95%. However, we always recommend consulting with agricultural professionals for critical decisions, especially for large-scale farming operations."
    },
    {
      question: "What types of plants does Agro AI support?",
      answer: "Agro AI currently supports a wide range of crops including vegetables, fruits, grains, and common garden plants. We are continuously expanding our database to include more plant species and disease types."
    },
    {
      question: "How do I scan a plant?",
      answer: "It's simple! Just navigate to the Scan page, take a clear photo of the affected plant or upload an existing image, and click 'Analyze Plant'. Our AI will process the image and provide results within seconds, including disease identification and treatment recommendations."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security very seriously. All uploaded images and personal information are encrypted and stored securely. We use industry-standard security measures to protect your data. Please refer to our Privacy Policy for detailed information."
    },
    {
      question: "Do I need to create an account to use Agro AI?",
      answer: "While you can try our demo without an account, creating a free account allows you to save your scan history, track plant health over time, and access personalized recommendations based on your previous scans."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, Agro AI is accessible through any web browser on your mobile device or computer. We are working on dedicated mobile apps for iOS and Android, which will be available soon."
    },
    {
      question: "What should I do after getting disease detection results?",
      answer: "After receiving your results, review the recommended treatments and medicines. We provide detailed information about each treatment option, including application methods and safety precautions. For severe infections or commercial farming, we recommend consulting with local agricultural experts."
    },
    {
      question: "Can I use Agro AI offline?",
      answer: "Currently, Agro AI requires an internet connection to process images and provide disease detection results, as the AI processing happens on our servers. We are exploring options for offline capabilities in future updates."
    },
    {
      question: "How much does Agro AI cost?",
      answer: "Agro AI offers a free tier with limited scans per month. For unlimited scans and advanced features like detailed treatment guides and crop health tracking, we offer affordable subscription plans. Visit our pricing page for more details."
    },
    {
      question: "What if the AI cannot identify the disease?",
      answer: "If our AI is uncertain about a diagnosis or if the confidence level is low, we will inform you. In such cases, we recommend taking additional photos from different angles or consulting with agricultural professionals for a proper diagnosis."
    },
    {
      question: "Can I get treatment recommendations for organic farming?",
      answer: "Yes! Our treatment recommendations include both conventional and organic solutions. You can filter results to show only organic treatment options that are suitable for sustainable and organic farming practices."
    },
    {
      question: "How often should I scan my plants?",
      answer: "We recommend regular monitoring, especially during growing seasons. Weekly scans can help detect diseases early when they are easier to treat. For plants showing symptoms, daily monitoring may be beneficial until the condition improves."
    },
    {
      question: "Can Agro AI predict future diseases?",
      answer: "While we primarily focus on detecting current diseases, our system can provide preventive recommendations based on your plant history, local climate conditions, and common disease patterns in your area."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through email at info@agroai.com or call us at +1 (234) 567-890. We typically respond within 24 hours on business days."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about Agro AI
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-8 bg-muted/50 rounded-lg border border-border text-center">
            <h2 className="text-2xl font-semibold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Cannot find the answer you are looking for? Feel free to reach out to our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:info@agroai.com"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Email Support
              </a>
              <a 
                href="tel:+1234567890"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQs;

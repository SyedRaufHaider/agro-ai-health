import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate is Agro AI's disease detection?",
    answer: "Agro AI achieves over 95% accuracy in disease detection. Our AI models are trained on millions of plant images and are continuously updated with new data. However, we always recommend consulting with agricultural experts for critical decisions."
  },
  {
    question: "What types of plants can Agro AI analyze?",
    answer: "Agro AI can analyze over 200 different plant species including vegetables, fruits, ornamental plants, and major crops. Our database covers common and rare diseases affecting these plants."
  },
  {
    question: "Do I need an internet connection to use Agro AI?",
    answer: "Yes, an active internet connection is required as our AI processing happens in the cloud. This allows us to use powerful computing resources and ensures you always have access to the latest models and disease information."
  },
  {
    question: "How quickly will I get results?",
    answer: "Results are typically delivered in under 3 seconds after uploading your image. The AI analyzes the image instantly and provides detailed diagnosis and treatment recommendations immediately."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We take data privacy seriously. All images are encrypted during transmission and storage. We never share your personal information or images with third parties without your explicit consent."
  },
  {
    question: "Can I save my scan history?",
    answer: "Yes! With a free account, you can save all your scans, track disease progression over time, and access your complete plant health history anytime from any device."
  },
  {
    question: "What if the AI can't identify the disease?",
    answer: "If our AI is uncertain about a diagnosis (confidence below 80%), we'll recommend you consult with an agricultural expert or local extension office. We also provide an option to submit your case for manual review by our team of plant pathologists."
  },
  {
    question: "Are the medicine recommendations available in my area?",
    answer: "We provide both generic treatment approaches and specific medicine recommendations. While we try to suggest commonly available products, availability may vary by region. Always check with local agricultural suppliers for product availability."
  }
];

export const FAQ = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Agro AI
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 hover:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-card-foreground pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

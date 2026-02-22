import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Agro AI's plant disease detection service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Agro AI provides an AI-powered plant disease detection and treatment recommendation service. You agree to use this service only for lawful purposes and in accordance with these Terms of Service.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to misuse or interfere with the service</li>
                <li>You will not attempt to gain unauthorized access to any part of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Service Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                While Agro AI strives for accuracy in plant disease detection, our service provides recommendations that should be used as guidance only. We recommend consulting with agricultural professionals for critical decisions. The service is provided "as is" without warranties of any kind, either express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you upload images to our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You retain all rights to your content</li>
                <li>You grant us permission to process your images for disease detection</li>
                <li>You confirm that you have the right to upload the content</li>
                <li>We may use anonymized data to improve our AI models</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Agro AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. This includes any damages resulting from crop losses or treatment decisions based on our recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some features of Agro AI may require a paid subscription. By subscribing, you agree to pay all fees associated with your chosen plan. Subscriptions automatically renew unless cancelled before the renewal date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of Agro AI is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: legal@agroai.com<br />
                Phone: +1 (234) 567-890
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

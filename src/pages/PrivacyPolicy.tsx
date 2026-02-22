import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Agro AI, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our plant disease detection service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect several types of information to provide and improve our service:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name and email address when you create an account</li>
                <li>Phone number (if provided)</li>
                <li>Payment information for subscription services</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Images of plants you upload for disease detection</li>
                <li>Scan history and results</li>
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide and maintain our plant disease detection service</li>
                <li>To process your images and deliver accurate disease detection results</li>
                <li>To improve our AI models and service accuracy</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To detect, prevent, and address technical issues</li>
                <li>To send you newsletters and marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We take the security of your data seriously:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Your data is stored on secure servers with encryption</li>
                <li>We use industry-standard security measures to protect your information</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>We regularly review and update our security practices</li>
                <li>Plant images are processed and stored securely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                <li>In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access: Request copies of your personal data</li>
                <li>Correction: Request correction of inaccurate data</li>
                <li>Deletion: Request deletion of your personal data</li>
                <li>Restriction: Request restriction of processing your data</li>
                <li>Portability: Request transfer of your data to another service</li>
                <li>Objection: Object to our processing of your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of your country. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@agroai.com<br />
                Phone: +1 (234) 567-890<br />
                Address: 123 Farm Road, Agriculture City, AC 12345
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

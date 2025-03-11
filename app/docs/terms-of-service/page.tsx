import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function TermsOfService() {
  return (
    <>
      <Breadcrumb
        items={[
          { title: "Home", href: "/" },
          { title: "Documentation", href: "/docs" },
          { title: "Terms of Service", href: "/docs/terms-of-service", isCurrentPage: true }
        ]}
        description="Our terms of service and usage guidelines."
      />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Divine Comfort. These Terms of Service govern your use of our website and services, including our mobile application, features, content, and functionality (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Service"</strong> refers to the Divine Comfort website, mobile application, and all content, services, and products available at or through the website and application.</li>
            <li><strong>"User"</strong> refers to the individual accessing or using the Service, or the company or organization on behalf of which that individual is accessing or using the Service.</li>
            <li><strong>"Content"</strong> refers to all text, information, images, audio, video, and data that is uploaded, shared, or otherwise made available through the Service.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Account Registration and Requirements</h2>
          <p>
            To access certain features of the Service, you may be required to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself.
          </p>
          <p>
            You are responsible for safeguarding your account credentials and for any activities or actions under your account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. User Content and Conduct</h2>
          <p>
            Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post on or through the Service.
          </p>
          <p>
            By posting Content on or through the Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
            <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.</li>
          </ul>
          <p>
            We reserve the right to remove any Content that violates these Terms or that we find objectionable for any reason, without prior notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Spiritual Guidance and Devotional Content</h2>
          <p>
            Divine Comfort provides spiritual guidance, devotional content, and community features. While we strive to provide meaningful and supportive content, we do not guarantee that our Service will meet your specific spiritual needs or expectations.
          </p>
          <p>
            The spiritual guidance, devotional content, and community interactions provided through our Service are not intended to replace professional counseling, therapy, or medical advice. If you are experiencing a crisis or need professional help, please seek appropriate assistance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Bible Study and Journal Features</h2>
          <p>
            Our Service includes Bible study resources and personal journaling features. These features are provided for personal spiritual growth and reflection.
          </p>
          <p>
            We make efforts to ensure the accuracy of biblical content, but we do not guarantee complete accuracy or endorse any particular theological interpretation. Users should verify information through their own study and research.
          </p>
          <p>
            Journal entries and personal reflections are private to your account. However, you acknowledge that no internet transmission is ever completely secure or error-free, and we cannot guarantee absolute security of your data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Community Guidelines</h2>
          <p>
            When participating in our community features, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Treat others with respect and kindness</li>
            <li>Refrain from harassment, hate speech, or discriminatory language</li>
            <li>Avoid sharing content that is harmful, offensive, or inappropriate</li>
            <li>Respect the privacy and boundaries of other users</li>
            <li>Engage in constructive and supportive discussions</li>
          </ul>
          <p>
            Violation of these guidelines may result in content removal, account suspension, or termination.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Divine Comfort and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
          <p>
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Divine Comfort.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
          <p>
            In no event shall Divine Comfort, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="font-medium">support@divine-comfort.com</p>
        </section>
      </div>
    </>
  );
} 
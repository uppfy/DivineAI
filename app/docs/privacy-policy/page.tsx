import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function PrivacyPolicy() {
  return (
    <>
      <Breadcrumb
        items={[
          { title: "Home", href: "/" },
          { title: "Documentation", href: "/docs" },
          { title: "Privacy Policy", href: "/docs/privacy-policy", isCurrentPage: true }
        ]}
        description="How we collect, use, and protect your information."
      />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Divine Comfort ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <p>
            We collect several types of information from and about users of our Service:
          </p>
          
          <h3 className="text-xl font-medium mt-6">2.1 Personal Information</h3>
          <p>
            When you register for an account, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name and display name</li>
            <li>Email address</li>
            <li>Username</li>
            <li>Password (stored in encrypted form)</li>
            <li>Profile information you choose to provide</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6">2.2 User Content</h3>
          <p>
            We collect and store content that you create, share, or post to the Service, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Journal entries and personal reflections</li>
            <li>Prayer requests and spiritual guidance inquiries</li>
            <li>Comments and posts in community discussions</li>
            <li>Responses to devotional content</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6">2.3 Usage Information</h3>
          <p>
            We automatically collect certain information about your device and how you interact with our Service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Device information (type, operating system, browser)</li>
            <li>IP address and general location</li>
            <li>Pages visited and features used</li>
            <li>Time spent on the Service</li>
            <li>Referring websites or applications</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing, maintaining, and improving our Service</li>
            <li>Processing and completing transactions</li>
            <li>Sending you technical notices, updates, and administrative messages</li>
            <li>Responding to your comments, questions, and requests</li>
            <li>Personalizing your experience on the Service</li>
            <li>Delivering devotional content and spiritual resources tailored to your interests</li>
            <li>Facilitating community interactions and discussions</li>
            <li>Monitoring and analyzing trends, usage, and activities in connection with our Service</li>
            <li>Detecting, preventing, and addressing technical issues, fraud, or illegal activity</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Sharing Your Information</h2>
          <p>
            We may share your information in the following circumstances:
          </p>
          
          <h3 className="text-xl font-medium mt-6">4.1 With Your Consent</h3>
          <p>
            We may share your information when you give us explicit permission to do so.
          </p>
          
          <h3 className="text-xl font-medium mt-6">4.2 Service Providers</h3>
          <p>
            We may share your information with third-party vendors, service providers, and contractors who perform services for us or on our behalf, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cloud hosting and storage providers</li>
            <li>Analytics services</li>
            <li>Email and communication service providers</li>
            <li>Payment processors</li>
          </ul>
          <p>
            These service providers are bound by contractual obligations to keep personal information confidential and use it only for the purposes for which we disclose it to them.
          </p>
          
          <h3 className="text-xl font-medium mt-6">4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
          </p>
          
          <h3 className="text-xl font-medium mt-6">4.4 Protection of Rights</h3>
          <p>
            We may disclose your information to protect the rights, property, or safety of Divine Comfort, our users, or others.
          </p>
          
          <h3 className="text-xl font-medium mt-6">4.5 Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our Service of any change in ownership or uses of your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>
          <p>
            While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Your account information is protected by a password. You are responsible for keeping your password confidential.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You can request copies of your personal information.</li>
            <li><strong>Correction:</strong> You can request that we correct inaccurate information about you.</li>
            <li><strong>Deletion:</strong> You can request that we delete your personal information in certain circumstances.</li>
            <li><strong>Restriction:</strong> You can request that we restrict the processing of your information in certain circumstances.</li>
            <li><strong>Data Portability:</strong> You can request that we transfer your information to another organization or directly to you.</li>
            <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Children's Privacy</h2>
          <p>
            Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To maintain your authenticated session and remember your preferences</li>
            <li>To understand how you use our Service</li>
            <li>To improve our Service based on your usage patterns</li>
            <li>To personalize your experience</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Third-Party Links and Services</h2>
          <p>
            Our Service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
          <p>
            We strongly advise you to review the privacy policy of every site you visit.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="font-medium">privacy@divine-comfort.com</p>
        </section>
      </div>
    </>
  );
} 
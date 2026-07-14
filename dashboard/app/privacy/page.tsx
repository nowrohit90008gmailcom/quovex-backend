'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] font-['Inter']">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#00288e] flex items-center justify-center shadow-lg shadow-[#00288e]/20 mb-2">
            <span className="material-symbols-outlined text-[28px] text-white">shield</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#00288e]">Privacy Policy</h1>
          <p className="text-[#757684] text-sm">Last updated: July 1, 2026</p>
        </div>

        {/* 1. Introduction */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">1. Introduction</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex Inc. (&quot;Quovex,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy of all individuals who use our
            mobile application and web platform (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you access and use the Quovex application, website, and
            related services, including but not limited to our exam preparation tools, quiz engine, app lock functionality,
            reward system, and referral program.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            This Policy applies to all users of the Service worldwide, including users in the European Economic Area (EEA),
            the United Kingdom, the United States, Canada, India, and other jurisdictions. Please read this Policy carefully
            to understand our practices regarding your personal data. By registering for, accessing, or using the Service,
            you acknowledge that you have read and understood this Privacy Policy. If you do not agree with any part of this
            Policy, you must discontinue use of the Service immediately.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            This Policy is effective as of July 1, 2026 (the &quot;Effective Date&quot;). We may update this Policy from time to
            time; material changes will be communicated in accordance with Section 13 below.
          </p>
        </div>

        {/* 2. Information We Collect */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">2. Information We Collect</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We collect various categories of information to provide, personalize, and improve the Service. The types of
            information we collect depend on how you interact with Quovex.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.1 Personal Information</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            When you create an account, we collect the following personal identifiers and demographic information: your
            full name, email address, age or date of birth, country of residence, education level (e.g., high school,
            undergraduate, postgraduate), and institution type (e.g., school, college, university, self-study). This
            information is necessary to create and maintain your account, tailor content to your educational background,
            and comply with age-related legal requirements.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.2 Academic Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            To deliver our core exam preparation functionality, we collect and store academic data including: your selected
            exam preferences and target examinations (e.g., specific standardized tests or academic subjects), custom study
            tags you create to organize your materials, quiz performance metrics including answers submitted, scores
            achieved, time taken per question, and accuracy rates, detailed study session records including session
            duration, timestamps, and subjects studied, points accumulated through study activities, streak data tracking
            consecutive study days, and leaderboard rankings. This data is used to generate personalized quizzes, track
            your academic progress, and power gamification features.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.3 Device Information</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We automatically collect certain information about the device you use to access the Service, including: device
            type and model (e.g., smartphone, tablet, or desktop), operating system version (e.g., iOS, Android, Windows,
            macOS), Quovex application version number, unique device identifiers (such as Android Advertising ID,
            iOS Identifier for Advertisers (IDFA), or similar device-level identifiers), and device language and regional
            settings. This information helps us optimize the Service for your device, diagnose technical issues, and
            prevent fraud.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.4 Usage Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We collect detailed information about how you interact with the Service, including: feature interaction logs
            recording which screens, buttons, and features you access, time spent on each section of the application,
            session start and end timestamps, honor check responses submitted during study sessions (used for anti-cheat
            purposes), and feature adoption metrics. This usage data enables us to improve the user experience, identify
            popular features, and detect anomalous or fraudulent behavior.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.5 App Lock Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex offers an optional app lock feature that restricts access to certain applications on your device
            during study sessions. To operate this feature, we collect: a list of applications you choose to lock or
            whitelist, lock and unlock event timestamps, credit balance information related to the app lock reward system,
            unlock history including the frequency and timing of attempted unlocks, and session compliance data. This
            information is collected solely to enforce your chosen study focus settings and to calculate any associated
            rewards. We do not access the content of your locked applications.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.6 Communication Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            When you contact our support team, submit feedback, or configure your communication preferences, we collect:
            support inquiries and correspondence including any information you voluntarily provide about issues or
            suggestions, feedback submission content, notification preferences (e.g., push notification opt-in status,
            email notification preferences for study reminders, rewards updates, and product announcements), and
            communication channel preferences. We use this data to respond to your inquiries, improve the Service, and
            send you relevant communications in accordance with your preferences.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.7 Payment and Referral Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you participate in our referral program or reward system, we may collect: referral codes generated by you
            or shared with you, reward claim records and payout history, and Know Your Customer (KYC) documentation if
            required to process certain reward payouts. KYC documents may include government-issued identification (e.g.,
            passport, driver&apos;s license, national identity card) and proof of address (e.g., utility bill, bank
            statement). KYC information is collected only when necessary to comply with anti-money laundering regulations
            and is handled with the highest security standards.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">2.8 Location Data</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We collect country-level location information, typically derived from your IP address or the country you
            select during registration. This information allows us to comply with regional legal requirements, customize
            content and exam options relevant to your country, and analyze usage patterns by region. We do not collect
            precise GPS coordinates or real-time geolocation data through the Service.
          </p>
        </div>

        {/* 3. How We Collect Information */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">3. How We Collect Information</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We collect information through the following methods:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Direct Registration:</strong> When you create an account, fill out profile forms, or configure
            settings, you provide information directly to us. This includes registration details, exam preferences,
            study tags, and communication preferences.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>In-App Usage Tracking:</strong> As you interact with the Service, we automatically record your
            activities, including quiz attempts, study sessions, feature usage, app lock events, and honor check
            responses. This data is associated with your account and used to power personalization and analytics.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Automated Analytics:</strong> We use automated analytics tools, including third-party services, to
            collect aggregated and anonymized information about how users interact with the Service. This includes
            session duration, screen flow, crash reports, and performance metrics.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Third-Party Authentication Providers:</strong> If you choose to register or log in using Google
            Sign-In or other third-party authentication providers, we receive certain information from that provider as
            authorized by your account settings, typically including your name, email address, and profile picture. We
            do not receive or store your third-party account passwords.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Advertising Networks:</strong> We use Google AdMob to serve advertisements within the Service. AdMob
            may collect device identifiers, IP addresses, and advertising IDs to serve relevant ads, subject to Google&apos;s
            Privacy Policy and your device-level advertising preferences.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Customer Support:</strong> When you contact our support team via email, in-app chat, or other
            channels, we collect the information you provide in your communications, including any attachments, logs,
            or screenshots you choose to share.
          </p>
        </div>

        {/* 4. How We Use Information */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">4. How We Use Information</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We use the information we collect for the following purposes:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Personalization:</strong> We use your profile information, academic data, and usage patterns to
            personalize your Quovex experience, including recommending relevant study materials, tailoring quiz
            difficulty to your performance level, and customizing the application interface to your preferences.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Quiz Generation:</strong> Your exam preferences, study tags, and past quiz performance are used to
            generate personalized practice quizzes that target your areas of improvement and align with your chosen
            examination.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Leaderboards and Gamification:</strong> Academic data including points, streaks, and quiz scores
            are used to power leaderboard rankings, achievement systems, and gamification features that motivate and
            engage users.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Reward System:</strong> We use your activity data, referral codes, and KYC documentation to
            administer our reward and referral programs, calculate earned rewards, process payouts, and comply with
            applicable legal and regulatory obligations.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Anti-Cheat and Integrity:</strong> Usage data, honor check responses, and session patterns are
            analyzed to detect and prevent cheating, gaming of the leaderboard system, fraudulent activity, and other
            violations of our Terms of Service.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>App Lock Functionality:</strong> App lock data is used exclusively to operate the app lock feature,
            enforce your selected focus settings, and calculate any associated rewards or credits.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Analytics and Service Improvement:</strong> We analyze usage data, device information, and feature
            interactions to understand how the Service is used, identify technical issues, plan product improvements,
            and optimize performance.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Notifications and Communications:</strong> We use your email address and device notification tokens
            to send service-related communications (e.g., account verification, password resets), study reminders,
            reward notifications, and, with your consent, promotional messages about new features or products.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Referral Program:</strong> Referral codes and related data are used to track referrals, attribute
            rewards to referring users, and manage the referral program.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Advertising:</strong> Device identifiers and advertising IDs may be used to serve contextual and
            interest-based advertisements through Google AdMob. You can control ad personalization through your device
            settings.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Fraud Prevention and Security:</strong> We use collected information to detect, prevent, and respond
            to fraud, abuse, security incidents, and other harmful activities that could compromise the Service or our
            users.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Legal Compliance:</strong> We process information as necessary to comply with our legal obligations,
            including responding to lawful requests from public authorities, enforcing our Terms of Service, and
            meeting regulatory requirements related to KYC, anti-money laundering, and data protection.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Customer Support:</strong> Communication data is used to respond to your inquiries, resolve issues,
            and improve our support processes.
          </p>
        </div>

        {/* 5. Lawful Basis for Processing (GDPR) */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">5. Lawful Basis for Processing (GDPR)</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            For users in the European Economic Area and the United Kingdom, we process personal data under the following
            lawful bases as defined in the General Data Protection Regulation (GDPR) and the UK GDPR:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Consent (Article 6(1)(a)):</strong> We rely on your consent to process your personal data for certain
            purposes, including the collection of optional analytics data, the serving of personalized advertisements,
            and the sending of promotional communications. You have the right to withdraw your consent at any time
            without affecting the lawfulness of processing based on consent before its withdrawal.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Contract Performance (Article 6(1)(b)):</strong> We process your personal data as necessary to
            perform our obligations under the Terms of Service governing your use of the Quovex platform. This
            includes account management, quiz delivery, leaderboard functionality, reward administration, and app lock
            operation.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Legitimate Interests (Article 6(1)(f)):</strong> We rely on our legitimate interests to process
            personal data for purposes such as fraud detection and prevention, service improvement and analytics,
            network and information security, and enforcement of our Terms of Service. We have conducted legitimate
            interest assessments to ensure that our interests do not override your fundamental rights and freedoms.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Legal Obligation (Article 6(1)(c)):</strong> We process personal data where necessary to comply
            with applicable legal obligations, including retention of KYC documentation for regulatory compliance,
            responding to lawful requests from law enforcement or regulatory authorities, and maintaining records as
            required by tax and anti-money laundering laws.
          </p>
        </div>

        {/* 6. Data Sharing and Disclosure */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">6. Data Sharing and Disclosure</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We do not sell your personal information. We do not rent, trade, or otherwise transfer your personal data
            to third parties for their own marketing purposes. We may share your information in the following
            circumstances:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Service Providers:</strong> We engage trusted third-party service providers to perform functions on
            our behalf, including: cloud hosting infrastructure providers (e.g., AWS, Google Cloud, or equivalent) that
            store and process data on secured servers, analytics service providers that help us understand usage patterns
            and improve the Service, email delivery services used to send transactional and promotional communications,
            and customer support platform providers. These service providers are contractually bound to process your
            data only as instructed by us and to implement appropriate technical and organizational security measures.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Advertising Partners:</strong> We use Google AdMob to display advertisements. AdMob may collect and
            process device identifiers, IP addresses, and advertising IDs in accordance with Google&apos;s Privacy Policy.
            You can learn more about Google&apos;s data practices at https://policies.google.com/privacy and opt out of
            personalized advertising through your device&apos;s advertising settings.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Firebase (Optional):</strong> Quovex may use Google Firebase services for analytics, crash
            reporting, and push notification delivery. Firebase&apos;s data handling is governed by Google&apos;s Privacy Policy
            and the Firebase Terms of Service. Data collected by Firebase may be transferred to and processed by Google
            servers in the United States or other jurisdictions.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Legal Authorities:</strong> We may disclose your personal information if required to do so by law
            or in the good-faith belief that such action is necessary to: comply with a legal obligation, including
            subpoenas, court orders, or other legal processes, protect and defend our rights or property, prevent or
            investigate possible wrongdoing in connection with the Service, protect the personal safety of users or the
            public, or protect against legal liability.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization, bankruptcy, or
            sale of all or substantially all of our assets, your personal information may be transferred to the
            acquiring entity as part of the transaction. We will notify you via email and a prominent notice on the
            Service of any such change in ownership or control of your personal data.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Aggregated or De-Identified Data:</strong> We may share aggregated or de-identified information
            that cannot reasonably be used to identify you for research, benchmarking, marketing, or other business
            purposes. Such data is not subject to this Privacy Policy.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Third-Party Authentication Providers:</strong> If you register using Google Sign-In, the
            authentication process is handled directly between your device and Google. We receive only the
            information you authorize Google to share with us. We encourage you to review Google&apos;s Privacy Policy
            for information about their data practices.
          </p>
        </div>

        {/* 7. Data Retention */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">7. Data Retention</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We retain your personal information only for as long as necessary to fulfill the purposes described in this
            Privacy Policy, unless a longer retention period is required or permitted by applicable law.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Active Accounts:</strong> For as long as your account remains active, we retain your personal
            information, academic data, usage data, and app lock data to provide the Service. When you delete your
            account, we begin the deletion process as described below.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>KYC Documents:</strong> Know Your Customer documentation collected for reward payout purposes is
            retained for a period of five (5) years following the date of the associated reward payout. This retention
            period is necessary to comply with applicable anti-money laundering, tax, and financial regulatory
            obligations. After this period, KYC documents are securely destroyed.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Session Data:</strong> Detailed study session records, including timestamps, duration, and
            performance data, are retained for a period of three (3) years from the date of collection. After this
            period, session data is either anonymized or deleted.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Analytics Data:</strong> Aggregated and individual analytics data is retained for a period of two
            (2) years. After two years, analytics data is anonymized such that it can no longer be attributed to a
            specific user or device.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Deleted Accounts:</strong> When you request deletion of your account, we will purge your personal
            data from our active systems within thirty (30) days of your request, subject to the following exceptions:
            data that we are legally obligated to retain (including KYC documents as described above, or data subject
            to a legal hold arising from litigation, investigation, or regulatory proceedings) will be retained for
            the period required by applicable law; backup copies may persist temporarily in our backup systems for up
            to an additional sixty (60) days after the deletion date, after which they are automatically overwritten.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Legal Holds:</strong> If your data is subject to a legal hold (e.g., due to pending litigation,
            regulatory investigation, or a preservation obligation), we will retain the relevant data until the hold
            is lifted. You will be notified if your deletion request cannot be fulfilled due to a legal hold.
          </p>
        </div>

        {/* 8. Data Security */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">8. Data Security</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex implements a comprehensive security program designed to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. Our security measures include:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Encryption in Transit:</strong> All data transmitted between the Quovex application and our
            servers is encrypted using Transport Layer Security (TLS) protocol version 1.3, ensuring that your
            information is protected during transmission over public networks.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Encryption at Rest:</strong> Personal data stored on our servers is encrypted at rest using
            Advanced Encryption Standard (AES) with 256-bit keys, providing strong protection against unauthorized
            access to stored data.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Access Controls:</strong> Access to personal data within our organization is restricted to
            authorized personnel who require such access to perform their job functions. We implement role-based access
            controls, multi-factor authentication, and comprehensive access logging to ensure accountability.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Security Audits:</strong> We conduct regular security audits, vulnerability assessments, and
            penetration testing of our systems and infrastructure to identify and address potential security weaknesses.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Employee Training:</strong> All Quovex employees and contractors who handle personal data
            receive mandatory training on data protection, privacy, and security best practices. We maintain
            confidentiality agreements and enforce disciplinary measures for violations of our security policies.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            <strong>Limitations:</strong> Despite our best efforts, no method of electronic storage or transmission
            over the Internet is 100% secure. We cannot guarantee absolute security of your data. By using the Service,
            you acknowledge that you transmit your personal data at your own risk. If you have reason to believe that
            your account or data is no longer secure, please contact us immediately at supportquovex@gmail.com.
          </p>
        </div>

        {/* 9. Your Rights */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">9. Your Rights</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Depending on your jurisdiction, you may have the following rights regarding your personal data. We will
            respond to all legitimate requests within thirty (30) days of receipt, unless a longer period is required
            by applicable law.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">9.1 Rights for EEA/UK Users (GDPR)</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you are located in the European Economic Area or the United Kingdom, you have the following rights under
            the GDPR:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right of Access (Article 15):</strong> You have the right to obtain confirmation from us as to
            whether or not your personal data is being processed, and if so, to request access to that data, including
            a copy of the personal data we hold about you, along with information about the purposes of processing,
            categories of data, recipients, retention periods, and your other rights.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Rectification (Article 16):</strong> You have the right to request correction of any
            inaccurate or incomplete personal data we hold about you. You may update certain information directly
            through your account settings.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Erasure (Article 17) — &quot;Right to be Forgotten&quot;:</strong> You have the right to request
            deletion of your personal data where: the data is no longer necessary for the purposes for which it was
            collected, you withdraw your consent and no other lawful basis applies, you object to processing based on
            legitimate interests and no overriding legitimate grounds exist, the data has been unlawfully processed, or
            deletion is required to comply with a legal obligation. This right is subject to exceptions, including
            where processing is necessary for compliance with legal obligations or the establishment, exercise, or
            defense of legal claims.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Restrict Processing (Article 18):</strong> You have the right to request restriction of
            processing in certain circumstances, including: where you contest the accuracy of the data (for a period
            enabling us to verify accuracy), where processing is unlawful and you oppose erasure and request
            restriction instead, where we no longer need the data but you require it for legal claims, or where you
            have objected to processing pending verification of whether our legitimate grounds override your rights.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Data Portability (Article 20):</strong> You have the right to receive your personal data,
            which you have provided to us, in a structured, commonly used, and machine-readable format (e.g., CSV or
            JSON), and to transmit that data to another controller without hindrance, where processing is based on
            consent or contract performance and is carried out by automated means.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Object (Article 21):</strong> You have the right to object, on grounds relating to your
            particular situation, to processing of your personal data where the lawful basis is our legitimate
            interests (including profiling). We will cease processing unless we demonstrate compelling legitimate
            grounds that override your interests, rights, and freedoms, or for the establishment, exercise, or defense
            of legal claims. You also have the absolute right to object to processing for direct marketing purposes.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you have the right
            to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing
            carried out prior to withdrawal. You can withdraw consent by adjusting your settings or contacting us at
            supportquovex@gmail.com.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with your local
            supervisory authority if you believe that our processing of your personal data violates applicable data
            protection law. For EEA users, the relevant authority is the Data Protection Commission or the
            supervisory authority of your country of residence. For UK users, the relevant authority is the Information
            Commissioner&apos;s Office (ICO). Contact details for your local supervisory authority can be found at
            https://edpb.europa.eu/about-edpb/about-edpb/members_en.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">9.2 Rights for California Users (CCPA)</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you are a resident of the State of California, the California Consumer Privacy Act (CCPA) grants you the
            following additional rights, subject to applicable exceptions and limitations:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Know:</strong> You have the right to request that we disclose the categories and specific
            pieces of personal information we have collected about you, the categories of sources from which the
            information is collected, the business or commercial purpose for collecting the information, and the
            categories of third parties with whom we share the information.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Delete:</strong> You have the right to request deletion of personal information we have
            collected from you, subject to certain exceptions (including where the information is necessary to complete
            a transaction, detect security incidents, comply with legal obligations, or exercise free speech rights).
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Opt-Out of Sale:</strong> Quovex does not sell personal information as defined under
            the CCPA. We do not and will not sell your personal information to third parties for monetary or other
            valuable consideration.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of
            your CCPA rights. This means we will not deny you goods or services, charge different prices or rates, or
            provide a different level or quality of services based on your exercise of these rights.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Shine the Light:</strong> California Civil Code Section 1798.83 permits California residents to
            request certain information regarding our disclosure of personal information to third parties for their
            direct marketing purposes. We do not share personal information for third-party direct marketing purposes.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">9.3 How to Exercise Your Rights</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            To exercise any of the rights described in this Section, please submit a request to:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Email: supportquovex@gmail.com
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We will verify your identity before processing your request. For CCPA requests, we may ask you to provide
            additional information to verify your identity, such as your email address on file and other account
            details. If we cannot verify your identity within 45 days, we may deny your request. You may designate an
            authorized agent to make a request on your behalf by providing written authorization signed by you.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We will respond to your request within thirty (30) days for GDPR requests and within forty-five (45) days
            for CCPA requests, unless a longer period is permitted or required by applicable law. If we are unable to
            fulfill your request, we will explain the reasons for our inability to do so.
          </p>
        </div>

        {/* 10. Children's Privacy */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">10. Children&apos;s Privacy</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex is not directed at children under the age of 13 (or 16 for users in the European Economic Area,
            in accordance with Article 8 of the GDPR). We do not knowingly collect personal information from children
            below these age thresholds without verifiable parental consent.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            During registration, we request age information to verify that users meet the minimum age requirement. If
            we become aware that a child under the applicable minimum age has provided us with personal information
            without parental consent, we will take steps to delete such information promptly and deactivate the
            associated account.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you are a parent or guardian and you believe that your child has provided personal information to us
            without your consent, please contact us immediately at supportquovex@gmail.com. We will investigate the
            matter and, if confirmed, delete the child&apos;s personal data and terminate the account.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We encourage parents and guardians to monitor their children&apos;s online activities and to instruct their
            children never to provide personal information through our Service without parental permission.
          </p>
        </div>

        {/* 11. International Data Transfers */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">11. International Data Transfers</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Your personal information may be transferred to, stored on, and processed in servers located in countries
            other than your country of residence. Our primary data infrastructure is located in the United States and
            may be supplemented by additional data centers in other jurisdictions for performance and redundancy
            purposes.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>EU/EEA and UK Users:</strong> If you are located in the European Economic Area or the United
            Kingdom, we transfer your personal data to countries outside the EEA/UK only where adequate safeguards are
            in place. For transfers to countries that have not been the subject of an adequacy decision by the European
            Commission or the UK Secretary of State (as applicable), we rely on Standard Contractual Clauses (SCCs)
            adopted by the European Commission and recognized by the UK Information Commissioner&apos;s Office to ensure that
            your data receives an equivalent level of protection. You may request a copy of the relevant SCCs by
            contacting us at supportquovex@gmail.com.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Other International Transfers:</strong> For users in other jurisdictions, we ensure that
            international data transfers are governed by appropriate legal mechanisms, including: binding corporate
            rules, data transfer agreements incorporating standard data protection clauses, or reliance on adequacy
            decisions where applicable.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            When we engage third-party service providers (including cloud infrastructure, analytics, and advertising
            providers), we ensure they provide adequate safeguards for your data through contractual obligations and,
            where required, data processing agreements that comply with applicable data protection laws.
          </p>
        </div>

        {/* 12. Cookies and Tracking */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">12. Cookies and Tracking Technologies</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The Quovex Service uses cookies, web beacons, and similar tracking technologies to enhance functionality,
            analyze usage, and deliver advertising. We categorize cookies as follows:
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Essential Cookies:</strong> These cookies are strictly necessary for the operation of the Service.
            They enable core functionality such as user authentication, session management, and security features.
            Essential cookies do not require your consent as they are necessary to provide the Service you request.
            Without these cookies, the Service cannot function properly.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Analytics Cookies:</strong> We use analytics cookies (including those from Google Analytics, Firebase
            Analytics, or equivalent services) to collect information about how users interact with the Service, such as
            which pages are visited most frequently, how users navigate the application, and error rates. These cookies
            are placed only with your prior consent (for EEA/UK users) or in accordance with applicable local law.
            You may withdraw your consent at any time through your device or browser settings.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Advertising Cookies:</strong> Google AdMob may use cookies and device identifiers to serve
            personalized advertisements within the Service. The use of these cookies is subject to Google&apos;s Privacy
            Policy and your device-level advertising preferences. You can opt out of personalized advertising by
            adjusting your device settings (e.g., enabling &quot;Limit Ad Tracking&quot; on iOS or &quot;Opt out of Ads
            Personalization&quot; on Android).
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            <strong>Managing Cookies:</strong> You can control and manage cookies in several ways: through your browser
            settings (most browsers allow you to block or delete cookies), through your device settings (for mobile
            applications, you can manage ad tracking and analytics permissions), or through in-app consent management
            tools we may provide. Please note that blocking essential cookies may impair the functionality of the
            Service.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            Our Service does not currently respond to &quot;Do Not Track&quot; (DNT) signals. We will update this Policy if we
            implement DNT response capabilities in the future.
          </p>
        </div>

        {/* 13. Changes to This Policy */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">13. Changes to This Policy</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We reserve the right to update or modify this Privacy Policy at any time. When we make material changes to
            this Policy, we will notify you through the following channels: by sending an email notification to the
            email address associated with your account at least seven (7) days before the changes take effect, and by
            displaying a prominent in-app notice within the Quovex application requesting your review of the
            updated Policy.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Changes become effective on the date specified in the updated Policy (the &quot;Revised Effective Date&quot;). We
            encourage you to review this Policy periodically to stay informed about how we protect your information.
            Your continued use of the Service after the Revised Effective Date constitutes your acceptance of the
            updated Policy. If you do not agree with the changes, you should discontinue use of the Service and delete
            your account before the Revised Effective Date.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            For non-material changes (such as clarifications, formatting corrections, or updates to contact
            information), we may update the Policy without prior notice, and the updated version will be posted on the
            Service with a revised &quot;Last updated&quot; date.
          </p>
        </div>

        {/* 14. Contact Information */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-8">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">14. Contact Information</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please
            contact us using the following information:
          </p>

          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-[#00288e] text-[20px] mt-0.5">mail</span>
            <div>
              <p className="text-[14px] leading-[24px] text-[#141b2b] font-semibold mb-0">Email (Primary):</p>
              <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
                <a href="mailto:supportquovex@gmail.com" className="text-[#00288e] hover:underline">supportquovex@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-[#00288e] text-[20px] mt-0.5">verified_user</span>
            <div>
              <p className="text-[14px] leading-[24px] text-[#141b2b] font-semibold mb-0">Data Protection Officer (DPO):</p>
              <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
                <a href="mailto:supportquovex@gmail.com" className="text-[#00288e] hover:underline">supportquovex@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-[#00288e] text-[20px] mt-0.5">location_on</span>
            <div>
              <p className="text-[14px] leading-[24px] text-[#141b2b] font-semibold mb-0">Physical Address:</p>
              <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
                Quovex Inc.<br />
                100 Innovation Drive, Suite 400<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
          </div>

          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We will acknowledge receipt of your inquiry within five (5) business days and will respond substantively
            within thirty (30) business days. If we require additional information to process your request, we will
            notify you accordingly.
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">EU Supervisory Authority</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you are located in the European Economic Area and wish to lodge a complaint regarding our data
            processing practices, you may contact your local data protection supervisory authority. Contact details for
            each EEA supervisory authority are available at:
            <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="text-[#00288e] hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              https://edpb.europa.eu/about-edpb/about-edpb/members_en
            </a>
          </p>

          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">UK Supervisory Authority</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            If you are located in the United Kingdom, you may lodge a complaint with the Information Commissioner&apos;s
            Office (ICO):
            <a href="https://ico.org.uk/make-a-complaint" className="text-[#00288e] hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              https://ico.org.uk/make-a-complaint
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

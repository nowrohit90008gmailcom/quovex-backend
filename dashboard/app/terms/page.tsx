'use client';

export default function TermsPage() {
  const lastUpdated = 'July 1, 2026';

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] font-['Inter']">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#00288e] flex items-center justify-center shadow-md shadow-[#00288e]/20">
            <span className="material-symbols-outlined text-[24px] text-white">description</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#00288e]">Terms of Service</h1>
        </div>
        <p className="text-[#757684] text-sm mb-8">Last updated: {lastUpdated}</p>

        {/* Section 1 - Acceptance of Terms */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">1. Acceptance of Terms</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Welcome to Quovex. By downloading, accessing, or using the Quovex mobile application, website, or any related services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (the &ldquo;Terms&rdquo;). If you do not agree to all of the terms and conditions set forth herein, you must not access or use the Service in any manner.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            These Terms constitute a legally binding agreement between you (&ldquo;User&rdquo; or &ldquo;you&rdquo;) and Quovex Inc. (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an account, completing a study session, or otherwise interacting with the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any other policies referenced herein.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            You represent and warrant that you are at least thirteen (13) years of age. If you are under the age of majority in your jurisdiction of residence but at least thirteen (13) years of age, you represent and warrant that a parent or legal guardian has reviewed and agreed to these Terms on your behalf. The Service is not intended for children under thirteen (13) years of age, and we do not knowingly collect personal information from such individuals.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from your failure to comply with this obligation.
          </p>
        </div>

        {/* Section 2 - Description of Service */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">2. Description of Service</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex is a comprehensive productivity and exam preparation application designed to help students and professionals optimize their study habits, track their progress, and achieve their academic goals. The Service provides a suite of integrated tools and features, including but not limited to:
          </p>
          <ul className="list-disc text-[14px] text-[#444653] mb-4 ml-4 space-y-1.5">
            <li className="mb-2"><strong>Timer and Study Sessions:</strong> Customizable countdown and count-up timers supporting focus, exam, pomodoro, and custom modes with automatic session logging and verification mechanisms.</li>
            <li className="mb-2"><strong>Quiz Engine:</strong> An integrated quiz platform featuring AI-generated practice questions across multiple subjects, exam tags, and difficulty levels, with performance analytics and progress tracking.</li>
            <li className="mb-2"><strong>Leaderboards and Competitions:</strong> Ranked leaderboards based on verified study time, points, and streaks, as well as time-limited competitions and challenges among users.</li>
            <li className="mb-2"><strong>Reward System:</strong> A points-based reward system through which users may accumulate points from verified study sessions and redeem them for rewards, gift cards, or other benefits as more fully described in Section 7.</li>
            <li className="mb-2"><strong>App Lock Feature:</strong> A productivity tool that restricts access to specified applications during study sessions, using UsageStatsManager and overlay permissions, as detailed in Section 8.</li>
            <li className="mb-2"><strong>Referral Program:</strong> A referral system that rewards users for inviting new users to the Service, subject to the terms and conditions set forth in Section 7.</li>
            <li className="mb-2"><strong>Social Features:</strong> Profile creation, friend connections, study groups, and messaging capabilities designed to foster a collaborative learning community.</li>
            <li className="mb-2"><strong>Analytics Dashboard:</strong> Comprehensive data visualization and reporting tools that display study patterns, time allocation, subject performance, streak history, and other metrics.</li>
            <li className="mb-2"><strong>Streak Tracking:</strong> Automated tracking of consecutive days of study activity, with streak milestones, rewards, and visual indicators of consistency.</li>
          </ul>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of any feature or component of the Service.
          </p>
        </div>

        {/* Section 3 - User Accounts */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">3. User Accounts</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">3.1 Registration</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            To access certain features of the Service, you must register for an account. When registering, you agree to provide accurate, current, and complete information as prompted by the registration form, including but not limited to your name, email address, and applicable educational details. You agree to update this information promptly to maintain its accuracy and completeness.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">3.2 Account Security</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            You are responsible for safeguarding the password and any other authentication credentials used to access your account. You agree not to disclose your credentials to any third party and to take sole responsibility for any activities or actions taken under your account, whether or not you have authorized such activities or actions. You must immediately notify us of any unauthorized access to or use of your account.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">3.3 One Account Per Person</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Each natural person is permitted to maintain no more than one (1) active account on the Service. The creation of multiple accounts by the same individual constitutes a material breach of these Terms and may result in the suspension or termination of all accounts held by that individual, as well as the forfeiture of any accumulated points, rewards, or benefits associated with such accounts.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">3.4 Account Suspension and Termination</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We reserve the right, in our sole discretion and without prior notice, to suspend, deactivate, or terminate your account and your access to the Service if we determine, in our sole judgment, that you have violated these Terms, engaged in fraudulent or abusive conduct, or if such action is necessary to protect the integrity, security, or functionality of the Service. You agree that we shall not be liable to you or any third party for any suspension or termination of your account or access to the Service.
          </p>
        </div>

        {/* Section 4 - User Conduct / Prohibited Activities */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">4. User Conduct and Prohibited Activities</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc text-[14px] text-[#444653] mb-4 ml-4 space-y-1.5">
            <li className="mb-2"><strong>Cheating and Manipulation:</strong> Manipulating, inflating, or fabricating study time, session duration, or any activity metrics through any means, including but not limited to: running fake or idle study sessions, using automated scripts, bots, or macros to simulate user activity, tampering with device clock or time zone settings to extend session duration artificially, or using GPS spoofing or location manipulation tools to falsify location-based verification.</li>
            <li className="mb-2"><strong>Multiple Accounts and Account Sharing:</strong> Creating or using more than one account per natural person; sharing your account credentials with any other person; allowing any third party to access or use your account; or using another user&rsquo;s account without authorization.</li>
            <li className="mb-2"><strong>Referral and Reward Fraud:</strong> Abusing the referral program by creating fake or duplicate accounts for the purpose of earning referral credits; referring yourself through multiple email addresses or identities; claiming rewards through fraudulent or misleading means; or any other manipulation of the reward or referral systems.</li>
            <li className="mb-2"><strong>Harassment and Abuse:</strong> Harassing, threatening, bullying, intimidating, stalking, or otherwise behaving abusively toward any other user, employee, or representative of Quovex; sending unsolicited or unauthorized advertising, promotional materials, or spam.</li>
            <li className="mb-2"><strong>Impersonation:</strong> Impersonating or misrepresenting your affiliation with any person or entity, including but not limited to Quovex employees, moderators, or administrators; using a false identity or alias for the purpose of deceiving others.</li>
            <li className="mb-2"><strong>Inappropriate Content:</strong> Posting, uploading, sharing, or transmitting any content that is unlawful, defamatory, obscene, pornographic, hateful, discriminatory, or otherwise objectionable; content that infringes upon the rights of any third party, including intellectual property rights and privacy rights.</li>
            <li className="mb-2"><strong>Reverse Engineering:</strong> Reverse engineering, decompiling, disassembling, decrypting, or otherwise attempting to derive the source code, underlying algorithms, or structure of the Service or any component thereof; circumventing, disabling, or tampering with any security-related features, anti-cheat mechanisms, or content protection systems.</li>
            <li className="mb-2"><strong>Intellectual Property Infringement:</strong> Reproducing, distributing, modifying, creating derivative works of, publicly displaying, or otherwise exploiting any content from the Service without our prior written consent, except as expressly permitted under these Terms.</li>
            <li className="mb-2"><strong>Legal Violations:</strong> Using the Service in any manner that violates any applicable local, state, national, or international law, regulation, or ordinance, including but not limited to data protection and privacy laws.</li>
            <li className="mb-2"><strong>Service Interference:</strong> Interfering with or disrupting the integrity or performance of the Service, including but not limited to: transmitting viruses, malware, or any other malicious code; overloading, flooding, or crashing the Service&rsquo;s infrastructure; engaging in denial-of-service attacks; or attempting to gain unauthorized access to the Service, its servers, or any systems or networks connected to the Service.</li>
          </ul>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            This list of prohibited activities is illustrative and not exhaustive. We reserve the right to investigate any suspected violation of these Terms and to take appropriate action, which may include but is not limited to issuing warnings, suspending or terminating accounts, deducting points, forfeiting rewards, reporting conduct to law enforcement authorities, and pursuing civil remedies.
          </p>
        </div>

        {/* Section 5 - Anti-Cheat System */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">5. Anti-Cheat System</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex employs an automated anti-cheat system designed to detect and deter fraudulent activity, protect the integrity of the leaderboards and reward systems, and ensure a fair and equitable experience for all users. By using the Service, you acknowledge and consent to the operation of this system as described herein.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">5.1 Honor Checks</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The anti-cheat system may randomly prompt you to complete an honor check during or immediately following a study session. An honor check is a brief verification prompt, which may require you to confirm your identity, respond to a question, or perform a simple action within a specified time limit. Failure to complete an honor check within the allotted time, or providing an incorrect or suspicious response, may result in the session being flagged for manual review.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">5.2 Suspicious Activity Detection</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The anti-cheat system continuously monitors user activity for patterns indicative of fraudulent behavior, including but not limited to: abnormally high study durations without breaks, irregular session start and end times, inconsistent interaction patterns, use of automation tools, device-level anomalies, and discrepancies between reported and actual activity. When the system identifies potentially suspicious activity, it may automatically flag the relevant session(s) or account for further investigation.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">5.3 Manual Review</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Flagged accounts and sessions are subject to manual review by Quovex personnel. During manual review, we may examine session logs, device metadata, interaction patterns, honor check responses, and any other data reasonably relevant to determining compliance with these Terms. We reserve the right to request additional information or documentation from you to assist in our review, and your failure to provide such information within a reasonable timeframe may result in adverse action against your account.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">5.4 Consequences and Appeals</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Upon a determination that a violation of these Terms has occurred, we may take one or more of the following actions at our sole discretion: (a) flagging the account or session in our system; (b) deducting some or all points earned during suspicious sessions; (c) imposing a temporary suspension of account privileges for a specified period; (d) permanently banning the account from the Service; and (e) forfeiting any accumulated rewards, points, or referral credits.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            If you believe that an action has been taken against your account in error, you may submit an appeal by contacting our support team at <strong>supportquovex@gmail.com</strong>. Your appeal must include your account identifier, a detailed explanation of the facts supporting your appeal, and any relevant evidence. We will review your appeal and respond within a reasonable timeframe. Please note that submission of an appeal does not guarantee a favorable outcome, and all decisions regarding appeals are final and binding in our sole discretion.
          </p>
        </div>

        {/* Section 6 - Rewards and Referral Program */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">6. Rewards and Referral Program</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">6.1 General</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Quovex may, from time to time, offer users the opportunity to earn points, credits, rewards, or other benefits through study activity, referrals, competitions, promotions, and other mechanisms. All rewards offered through the Service are promotional in nature and do not constitute monetary value, legal currency, or financial instruments. Rewards have no cash equivalent and may not be redeemed for cash, except as expressly provided in a specific promotion.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">6.2 Eligibility and Verification</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            To be eligible to receive rewards, users must maintain an active account in good standing and comply with all provisions of these Terms. We reserve the right to impose eligibility requirements, including but not limited to Know Your Customer (KYC) verification procedures, which may require you to provide valid government-issued identification (such as a passport, driver&rsquo;s license, or national identity card) and proof of address (such as a utility bill or bank statement dated within the last ninety (90) days). Failure to complete KYC verification within the specified timeframe may result in forfeiture of unredeemed rewards.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">6.3 Reward Tiers and Budget Caps</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Rewards are organized into tiers based on accumulated points, study time, streak milestones, and other metrics as determined by us in our sole discretion. We may establish budget caps on the total value of rewards distributed in any given calendar month, geographical region, or promotional period. If budget caps are reached, reward redemption may be suspended or deferred until the next period or until additional funds are allocated. We reserve the right to modify reward tiers, point valuations, redemption thresholds, and budget caps at any time without prior notice.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">6.4 Referral Program</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The Quovex referral program allows existing users (&ldquo;Referrers&rdquo;) to earn referral credits by inviting new users (&ldquo;Referees&rdquo;) to join the Service. For each new user who registers using a valid referral link or code and who is not an existing user, the following credit structure applies: (a) the Referee will receive one hundred (100) points upon successful registration and completion of their first study session; and (b) the Referrer will receive fifty (50) points upon the Referee&rsquo;s completion of their first verified study session. Referral credits are subject to verification and may be withheld or reversed if: the Referee&rsquo;s account is flagged for suspicious activity, the Referee is determined to be a duplicate or fake account, or the referral was obtained through prohibited means. Referral credits are non-transferable and have no cash value.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">6.5 Fraud and Abuse</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Any attempt to defraud, manipulate, or abuse the rewards or referral programs, including but not limited to creating fake accounts, using automated registration tools, referring oneself, engaging in referral link spamming, or any other activity that artificially inflates referral or reward metrics, shall constitute a material breach of these Terms. Upon discovery of such activity, we reserve the right to: void all rewards and referral credits associated with the offending account(s); impose a permanent ban on the offending user and any related accounts; and pursue any available legal remedies. No warnings or prior notice will be given before such action is taken in cases of confirmed fraud.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">6.6 Non-Transferability and Tax Responsibility</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Points, credits, and rewards are personal to the account holder and may not be sold, transferred, assigned, or combined with any other account, except as expressly authorized by us in writing. Rewards are provided on an &ldquo;as available&rdquo; basis and may be subject to additional terms and conditions specified at the time of redemption. You are solely responsible for any and all taxes, duties, or other governmental charges that may arise from your participation in the rewards or referral programs, including but not limited to income tax, gift tax, or value-added tax. We recommend that you consult with a qualified tax advisor regarding the tax implications of receiving rewards.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We reserve the right to modify, suspend, or terminate the rewards program or referral program at any time, in whole or in part, with or without notice. In the event of program termination, unredeemed points, credits, and rewards shall be forfeited without compensation.
          </p>
        </div>

        {/* Section 7 - App Lock Feature */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">7. App Lock Feature</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">7.1 Functionality and Permissions</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The App Lock feature is a productivity tool designed to help users maintain focus during study sessions by restricting access to selected applications on their device. This feature requires the following device permissions: (a) UsageStatsManager access, which allows the application to monitor application usage patterns and detect when restricted applications are opened; and (b) overlay permission, which allows the application to display a locked overlay on top of other applications. By enabling the App Lock feature, you acknowledge and grant permission for the Service to access these capabilities on your device.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">7.2 Credit System</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The App Lock feature operates on a credit-based system. For every sixty (60) minutes of verified study time completed, you will earn fifteen (15) unlock credits. Unlock credits are capped at a maximum of ninety (90) credits at any given time. Once the cap is reached, additional study time will not generate further credits until existing credits are consumed. Credits are deducted from your balance when you use the unlock or snooze functionalities as described below.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">7.3 Unlock Window and Ad Unlock</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Each day, you are allotted a combined unlock window of fifteen (15) minutes during which you may access restricted applications. During this unlock window, credits are consumed at a rate of one (1) credit per minute. If your credit balance reaches zero, the unlock window will close and restricted applications will be locked until additional credits are earned. Alternatively, you may watch an advertisement to unlock restricted applications for a limited duration. Ad-based unlocks are limited to a maximum of two (2) unlocks per hour. We reserve the right to modify the credit earning rate, credit cap, unlock window duration, credit consumption rate, and ad unlock limits at any time.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">7.4 &ldquo;Not Now&rdquo; Snooze</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The App Lock feature includes a &ldquo;Not Now&rdquo; snooze option that allows you to temporarily disable the lock for a specific application for a period of fifteen (15) minutes. The snooze period applies on a per-application basis, meaning that snoozing one application does not affect the lock status of other restricted applications. The snooze feature consumes unlock credits in accordance with Section 7.3 above. We reserve the right to limit the number of snooze uses per day or modify the snooze duration at any time.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">7.5 Disclaimer</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            The App Lock feature is provided as a voluntary productivity tool. Quovex makes no representations or warranties regarding the effectiveness of the App Lock feature in improving study habits, academic performance, or productivity outcomes. You acknowledge that you are solely responsible for your own study practices and academic results, and that the App Lock feature is not a substitute for personal discipline, time management, or professional academic guidance. Quovex shall not be liable for any loss, damage, or negative outcome arising from your use or inability to use the App Lock feature.
          </p>
        </div>

        {/* Section 8 - Intellectual Property */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">8. Intellectual Property</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">8.1 Ownership</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The Service, including but not limited to the Quovex application, website, software code, design elements, graphics, user interface, audiovisual content, algorithms, data models, documentation, and all other materials (collectively, the &ldquo;Quovex Content&rdquo;), is owned by Quovex Inc. or its licensors and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws. The Quovex name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Quovex Inc. or its affiliates. You may not use such marks without our prior written permission.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">8.2 License to Use</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to download, install, and use the Quovex mobile application on a device that you own or control, and to access and use the Service solely for your personal, non-commercial purposes. All rights not expressly granted to you under these Terms are reserved by Quovex Inc. and its licensors.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">8.3 User Content</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            By posting, uploading, sharing, or transmitting any content through the Service (&ldquo;User Content&rdquo;), you grant us a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, perform, display, distribute, and create derivative works of such User Content in connection with the operation, promotion, and improvement of the Service. You represent and warrant that: (a) you own or have all necessary rights to grant the foregoing license; (b) your User Content does not infringe the intellectual property rights, privacy rights, or other legal rights of any third party; and (c) your User Content complies with all applicable laws and regulations.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">8.4 Feedback</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            If you provide us with any suggestions, ideas, improvements, feature requests, or other feedback regarding the Service (&ldquo;Feedback&rdquo;), you hereby assign to us all right, title, and interest in and to such Feedback. We shall be free to use, exploit, and incorporate any Feedback into the Service or other products and services without any obligation of compensation, attribution, or confidentiality to you.
          </p>
        </div>

        {/* Section 9 - Third-Party Services */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">9. Third-Party Services</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            The Service may integrate with or incorporate certain third-party services, including but not limited to: (a) Google AdMob, for the delivery of advertisements; (b) Google Firebase, for analytics, authentication, cloud messaging, and database services; (c) Google Sign-In, for authentication and account creation; (d) Google Fonts, for typography rendering; and (e) third-party map services, for location-based features. Your use of these third-party services is subject to their respective terms of service, privacy policies, and data collection practices, which we encourage you to review carefully.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We do not own, control, operate, or endorse any third-party services integrated with the Service. We make no representations or warranties of any kind, express or implied, regarding the availability, functionality, accuracy, or security of such third-party services. We shall not be responsible or liable for any loss, damage, or harm arising from or relating to your use of, or reliance on, any third-party services, including but not limited to any data collection, processing, or sharing practices by such third parties.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            The Service may contain links to third-party websites or resources. We provide such links for your convenience only and do not endorse, control, or assume any responsibility for the content, products, services, or practices of any third-party websites or resources. Your interactions with any third party are solely between you and that third party.
          </p>
        </div>

        {/* Section 10 - Disclaimer of Warranties */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">10. Disclaimer of Warranties</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, QUOVEX INC., ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, AND NON-INFRINGEMENT.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            WE DO NOT WARRANT THAT: (a) THE SERVICE WILL MEET YOUR SPECIFIC REQUIREMENTS OR EXPECTATIONS; (b) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; (c) THE RESULTS OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE, RELIABLE, OR SUITABLE FOR ANY PARTICULAR PURPOSE; (d) THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIALS PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS; OR (e) ANY ERRORS OR DEFECTS IN THE SERVICE WILL BE CORRECTED.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            THE STUDY TIMER AND QUIZ ANALYTICS PROVIDED THROUGH THE SERVICE ARE INTENDED FOR INFORMATIONAL AND MOTIVATIONAL PURPOSES ONLY. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF TIME TRACKING, POINT CALCULATIONS, LEADERBOARD RANKINGS, OR ANY OTHER METRICS DISPLAYED ON THE SERVICE. YOU ACKNOWLEDGE THAT TIMING MECHANISMS MAY BE SUBJECT TO VARIATIONS DUE TO DEVICE PERFORMANCE, NETWORK LATENCY, SYSTEM CLOCK INACCURACIES, AND OTHER FACTORS BEYOND OUR CONTROL.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM US OR THROUGH THE SERVICE SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU. IN SUCH CASES, OUR WARRANTIES ARE LIMITED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.
          </p>
        </div>

        {/* Section 11 - Limitation of Liability */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">11. Limitation of Liability</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL QUOVEX INC., ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING OUT OF OR RELATING TO: (a) YOUR USE OR INABILITY TO USE THE SERVICE; (b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (c) ANY CONTENT OBTAINED FROM THE SERVICE; (d) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT; OR (e) ANY OTHER MATTER RELATING TO THE SERVICE.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            IN NO EVENT SHALL THE AGGREGATE LIABILITY OF QUOVEX INC. FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE EXCEED THE TOTAL AMOUNT OF FEES ACTUALLY PAID BY YOU TO QUOVEX INC. FOR THE USE OF THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM. IF YOU HAVE NOT PAID ANY FEES TO US DURING SUCH PERIOD, YOUR SOLE AND EXCLUSIVE REMEDY SHALL BE TO DISCONTINUE USING THE SERVICE.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            NOTHING IN THESE TERMS SHALL EXCLUDE OR LIMIT OUR LIABILITY FOR: (a) DEATH OR PERSONAL INJURY CAUSED BY OUR NEGLIGENCE; (b) FRAUD OR FRAUDULENT MISREPRESENTATION; OR (c) ANY OTHER LIABILITY THAT CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY NOT APPLY TO YOU.
          </p>
        </div>

        {/* Section 12 - Indemnification */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">12. Indemnification</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            You agree to defend, indemnify, and hold harmless Quovex Inc., its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, demands, actions, liabilities, losses, damages, judgments, settlements, costs, and expenses (including reasonable attorneys&rsquo; fees and court costs) arising out of or relating to: (a) your breach of any provision of these Terms; (b) your violation of any applicable law, regulation, or ordinance; (c) your infringement of any intellectual property rights, privacy rights, or other legal rights of any third party; (d) your User Content; (e) your use of the Service in a manner that violates these Terms; or (f) any fraudulent, negligent, or willfully wrongful act or omission by you.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you agree to cooperate with us in asserting any available defenses. You may not settle any claim subject to indemnification without our prior written consent.
          </p>
        </div>

        {/* Section 13 - Termination */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">13. Termination</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">13.1 Termination by You</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            You may terminate your account and cease using the Service at any time and for any reason by deleting your account through the account settings within the application or by contacting our support team at <strong>supportquovex@gmail.com</strong>. Upon such termination, your right to access and use the Service will immediately cease.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">13.2 Termination by Quovex</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We reserve the right, in our sole discretion and without prior notice, to terminate or suspend your account and access to the Service for any reason, including but not limited to: (a) breach of any provision of these Terms; (b) engagement in fraudulent, abusive, or illegal activity; (c) extended period of account inactivity (defined as no login or session activity for a continuous period of twelve (12) months or more); (d) failure to pay any fees owed in connection with premium features; or (e) compliance with legal requirements or requests from law enforcement or governmental authorities.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">13.3 Effects of Termination</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Upon termination of your account for any reason: (a) your license to use the Service shall immediately terminate; (b) we will delete or anonymize your personal data within thirty (30) days of termination, subject to our data retention obligations under applicable law; (c) any accumulated points, unredeemed rewards, referral credits, streaks, leaderboard rankings, and other accrued benefits shall be immediately forfeited without compensation; (d) any User Content you have posted may be removed or anonymized at our discretion; and (e) any provisions of these Terms that by their nature should survive termination shall survive, including but not limited to Sections 8 (Intellectual Property), 10 (Disclaimer of Warranties), 11 (Limitation of Liability), 12 (Indemnification), 14 (Dispute Resolution), and 17 (Entire Agreement).
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            We shall not be liable to you or any third party for any termination of your account or access to the Service.
          </p>
        </div>

        {/* Section 14 - Dispute Resolution */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">14. Dispute Resolution</h2>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-0 mb-2">14.1 Informal Resolution</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Before initiating any formal dispute resolution proceeding, you agree to first contact us at <strong>supportquovex@gmail.com</strong> and provide a written description of the dispute, including all relevant details and supporting documentation. We will review your notice and respond within thirty (30) days. If the dispute cannot be resolved informally within sixty (60) days of your initial notice, either party may pursue formal dispute resolution as provided below. You agree that this informal dispute resolution process is a condition precedent to initiating any arbitration or legal proceeding against Quovex.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">14.2 Mandatory Arbitration</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Any dispute, claim, or controversy arising out of or relating to these Terms or the Service, including the breach, termination, enforcement, interpretation, or validity thereof, shall be resolved exclusively by binding arbitration administered by the American Arbitration Association (&ldquo;AAA&rdquo;) under its Commercial Arbitration Rules and Supplementary Procedures for Consumer-Related Disputes, as modified by these Terms. The arbitration shall be conducted by a single arbitrator selected in accordance with the AAA Rules. The arbitration shall take place in New York, New York, unless the parties mutually agree to a different location or to conduct the arbitration virtually. The language of the arbitration shall be English. The arbitrator&rsquo;s decision shall be final and binding on the parties and may be entered as a judgment in any court of competent jurisdiction.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">14.3 Class Action Waiver</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDING SHALL BE CONDUCTED ON AN INDIVIDUAL BASIS AND NOT AS A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU HEREBY WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, PRIVATE ATTORNEY GENERAL ACTION, OR ANY OTHER PROCEEDING IN WHICH A PARTY SEEKS TO RELIEF ON BEHALF OF A GROUP OF PERSONS. THE ARBITRATOR SHALL HAVE NO AUTHORITY TO CONSOLIDATE MORE THAN ONE PERSON&rsquo;S CLAIMS OR TO PRESIDE OVER ANY CLASS OR REPRESENTATIVE PROCEEDING. IF A COURT OR ARBITRATOR DETERMINES THAT THIS CLASS ACTION WAIVER IS UNENFORCEABLE, THEN THE ENTIRE DISPUTE RESOLUTION PROVISION SHALL BE NULL AND VOID AND THE PARTIES SHALL BE DEEMED NOT TO HAVE AGREED TO ARBITRATE.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">14.4 Governing Law</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States of America, without regard to its conflict of laws principles. The United Nations Convention on Contracts for the International Sale of Goods shall not apply to these Terms. Notwithstanding the foregoing, the arbitration provisions of this Section 14 shall be governed by the Federal Arbitration Act, 9 U.S.C. &sect;&sect; 1-16.
          </p>
          <h3 className="text-[16px] font-semibold text-[#141b2b] mt-6 mb-2">14.5 Venue</h3>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            To the extent that the arbitration agreement set forth in this Section 14 is found to be unenforceable or invalid, or if you or we elect to seek injunctive or equitable relief in aid of arbitration, you agree that any legal action or proceeding arising out of or relating to these Terms or the Service shall be instituted exclusively in the state or federal courts located in New York County, New York, and you hereby submit to the personal jurisdiction of such courts and waive any objection based on improper venue or inconvenient forum.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            Notwithstanding the foregoing, either party may seek injunctive or equitable relief in any court of competent jurisdiction to protect its intellectual property rights or to enforce compliance with the anti-cheat provisions of these Terms, without waiving the right to arbitrate other disputes.
          </p>
        </div>

        {/* Section 15 - Force Majeure */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">15. Force Majeure</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            Neither party shall be liable for any failure or delay in performing its obligations under these Terms (except for payment obligations) if such failure or delay is caused by circumstances beyond that party&rsquo;s reasonable control, including but not limited to: acts of God, natural disasters, war, terrorism, civil unrest, strikes or labor disputes, fire, flood, earthquake, pandemic or epidemic, embargo, government action or regulation, failure of telecommunications or internet infrastructure, power outages, cyberattacks, or the unavailability of third-party services. The affected party shall use commercially reasonable efforts to mitigate the effects of the force majeure event and to resume performance of its obligations as soon as reasonably practicable.
          </p>
        </div>

        {/* Section 16 - Severability */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">16. Severability</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction or arbitrator, such provision shall be enforced to the maximum extent permissible so as to effect the intent of the parties, and the remaining provisions of these Terms shall continue in full force and effect. The invalid, illegal, or unenforceable provision shall be deemed modified to the minimum extent necessary to make it valid, legal, and enforceable, consistent with the original intent of the parties. If such modification is not possible, the offending provision shall be severed from these Terms and the remaining provisions shall remain in full force and effect.
          </p>
        </div>

        {/* Section 17 - Entire Agreement */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">17. Entire Agreement</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            These Terms, together with our Privacy Policy and any other documents expressly incorporated by reference herein, constitute the entire and exclusive agreement between you and Quovex Inc. regarding your use of the Service and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, relating to the subject matter hereof.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            No failure or delay by us in exercising any right, power, or privilege under these Terms shall operate as a waiver thereof, nor shall any single or partial exercise thereof preclude any other or further exercise thereof or the exercise of any other right, power, or privilege. The waiver of any breach of any provision of these Terms shall not be deemed a waiver of any subsequent breach of the same or any other provision.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            These Terms do not create a partnership, joint venture, agency, fiduciary, or employment relationship between you and Quovex Inc. You may not assign, delegate, or transfer these Terms or any of your rights or obligations hereunder, by operation of law or otherwise, without our prior written consent. Any purported assignment in violation of this provision shall be null and void. We may freely assign or delegate these Terms or any of our rights and obligations hereunder without your consent. These Terms shall be binding upon and inure to the benefit of the parties and their respective permitted successors and assigns.
          </p>
        </div>

        {/* Section 18 - Changes to Terms */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">18. Changes to Terms</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            We reserve the right, in our sole discretion, to modify, amend, or update these Terms at any time. If we make material changes to these Terms, we will notify you by: (a) sending an email to the email address associated with your account; (b) displaying an in-app notification; or (c) posting a prominent notice on the Service. Unless otherwise specified, material changes will become effective thirty (30) days after the date of such notice (the &ldquo;Notice Period&rdquo;). Non-material changes, such as typographical corrections, clarifications, or changes that do not materially affect your rights or obligations, may become effective immediately upon posting without prior notice.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            Your continued use of the Service following the effective date of any modification constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and delete your account within the Notice Period. We encourage you to review these Terms periodically for any updates.
          </p>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            The date at the top of these Terms indicates when the most recent changes were made. It is your responsibility to check for updates regularly.
          </p>
        </div>

        {/* Section 19 - Contact */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-4">
          <h2 className="text-[20px] font-semibold text-[#141b2b] mt-0 mb-4">19. Contact Information</h2>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-4">
            If you have any questions, concerns, or comments regarding these Terms or the Service, you may contact us using the following information:
          </p>
          <div className="text-[14px] leading-[24px] text-[#444653] mb-4 space-y-2">
            <p><strong>Email:</strong> supportquovex@gmail.com</p>
            <p><strong>Physical Address:</strong> Quovex Inc., 123 Innovation Drive, Suite 400, New York, NY 10001, United States of America</p>
            <p><strong>Response Time:</strong> We aim to respond to all inquiries within fifteen (15) business days of receipt. During periods of high volume, response times may be extended.</p>
          </div>
          <p className="text-[14px] leading-[24px] text-[#444653] mb-0">
            For legal notices or service of process, please direct all correspondence to the physical address listed above, marked &ldquo;Attention: Legal Department.&rdquo; Legal notices may also be sent via email to <strong>supportquovex@gmail.com</strong>, provided that a physical copy is also sent to the physical address listed above.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import { apiFetch, cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

const faqItems = [
  {
    question: 'How do I start a study session?',
    answer: 'Open the Quovex app and tap the "Start Session" button on the home screen. You can choose between Focus Mode, Pomodoro Timer, or a Custom Session. Set your preferred duration and subject tags before starting. The timer will begin counting down, and you can earn rewards upon successful completion.'
  },
  {
    question: 'How do I earn and redeem rewards?',
    answer: 'You earn Study Coins for every completed study session and streak milestone. Coins are credited automatically to your account. To redeem, navigate to the Rewards Shop in the app, browse available rewards (such as customization themes, focus music packs, or real-world gift cards), and tap "Redeem" on any item. Redemption may require a minimum coin balance.'
  },
  {
    question: 'Can I use the app lock feature while studying?',
    answer: 'Yes. The App Lock feature prevents you from leaving the study session to browse other apps. Once enabled, it locks your phone into the study interface until the timer ends or you complete a focus challenge. You can enable App Lock from the session settings before starting. Note that force-quitting the app will count as a failed session.'
  },
  {
    question: 'How do I create an account?',
    answer: 'Download the app and tap "Sign Up" on the login screen. You can register using your email address, Google account, or Apple ID. Provide a username and password (minimum 8 characters with at least one number). Verify your email address through the confirmation link sent to your inbox, and your account will be active immediately.'
  },
  {
    question: 'Is my study data backed up?',
    answer: 'Yes, all study statistics, session history, and progress data are automatically synced to the cloud when you are connected to the internet. This ensures your data is preserved even if you switch devices or reinstall the app. You can also manually export your data as a CSV file from the Settings menu.'
  },
  {
    question: 'What happens to my rewards if I delete my account?',
    answer: 'Account deletion is irreversible and results in the permanent loss of all Study Coins, rewards, streak data, and session history. We recommend redeeming any available coins and exporting your data before initiating account deletion. Please contact support if you need assistance recovering an account within 30 days of deletion.'
  },
  {
    question: 'How do streaks work?',
    answer: 'A streak is counted for each consecutive day you complete at least one study session of 15 minutes or more. Streaks reset at midnight in your local timezone if no session is logged. Maintaining longer streaks unlocks bonus coin multipliers, exclusive badges, and special rewards in the Rewards Shop.'
  },
  {
    question: 'Can I use Quovex on multiple devices?',
    answer: 'Yes, your account can be used on multiple devices simultaneously. Simply log in with the same credentials on each device. Your study data and progress sync in real time across all platforms. Note that running concurrent sessions on different devices may result in only the first session being counted for streak purposes.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Tap "Forgot Password" on the login screen and enter the email address associated with your account. A password reset link will be sent to your email within a few minutes. The link expires after one hour. If you do not receive the email, check your spam folder or contact support for assistance.'
  },
  {
    question: 'Is there a way to customize my study notifications?',
    answer: 'Yes. Navigate to Settings > Notifications to configure your preferences. You can enable or disable session reminders, streak alerts, reward notifications, and weekly summary emails. You can also set quiet hours during which no push notifications will be sent. Changes take effect immediately on your device.'
  }
];

const contactSubjects = [
  'Account',
  'Technical',
  'Billing',
  'Feature Request',
  'Report'
];

const responseTimes = [
  { priority: 'Critical', description: 'Service outage, data loss, security issue', responseTime: '< 4 hours' },
  { priority: 'High', description: 'Account access, payment failures, app crashes', responseTime: '< 24 hours' },
  { priority: 'Normal', description: 'Feature questions, general inquiries, feedback', responseTime: '< 48 hours' },
  { priority: 'Low', description: 'Documentation, suggestions, non-urgent requests', responseTime: '< 72 hours' }
];

export default function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/support/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message }),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  return (
    <div className={`${inter.className} bg-[#f9f9ff] text-[#141b2b] min-h-screen`}>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <h1 className="text-[30px] font-bold text-[#00288e] mb-8">Support</h1>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-6">
          <h2 className="text-[22px] font-semibold text-[#141b2b] mb-4">Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-[#e5e7eb] last:border-b-0">
              <button
                className="w-full flex items-center justify-between py-4 text-left text-[15px] font-medium text-[#141b2b] hover:text-[#00288e] transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span>{item.question}</span>
                <span className={`material-symbols-outlined text-[#00288e] transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === index ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-[14px] text-[#6b7280] leading-relaxed">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-6">
          <h2 className="text-[22px] font-semibold text-[#141b2b] mb-4">Contact Us</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-[14px]">
              Your message has been sent successfully. We will respond within the timeframe indicated below.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#141b2b] mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#141b2b] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#141b2b] mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent"
                >
                  <option value="" disabled>Select a subject</option>
                  {contactSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#141b2b] mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2.5 border border-[#c4c5d5] rounded-lg text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent resize-y"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              <button
                type="submit"
                className="bg-[#00288e] text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-[#1e40af] transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Response Times Section */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-6">
          <h2 className="text-[22px] font-semibold text-[#141b2b] mb-4">Response Times</h2>
          <p className="text-[14px] text-[#6b7280] mb-4">
            Our support team strives to respond within the following timeframes based on priority level:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="py-3 px-4 font-semibold text-[#141b2b]">Priority</th>
                  <th className="py-3 px-4 font-semibold text-[#141b2b]">Description</th>
                  <th className="py-3 px-4 font-semibold text-[#141b2b]">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {responseTimes.map((row) => (
                  <tr key={row.priority} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="py-3 px-4 font-medium text-[#141b2b]">{row.priority}</td>
                    <td className="py-3 px-4 text-[#6b7280]">{row.description}</td>
                    <td className="py-3 px-4 text-[#00288e] font-medium">{row.responseTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Resources Section */}
        <div className="bg-white rounded-xl border border-[#c4c5d5] p-6 mb-6">
          <h2 className="text-[22px] font-semibold text-[#141b2b] mb-4">Help Resources</h2>
          <ul className="space-y-3">
            <li>
              <a href="/privacy" className="text-[#00288e] text-[14px] hover:underline flex items-center">
                <span className="material-symbols-outlined text-[18px] mr-2">shield</span>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-[#00288e] text-[14px] hover:underline flex items-center">
                <span className="material-symbols-outlined text-[18px] mr-2">description</span>
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#faq" className="text-[#00288e] text-[14px] hover:underline flex items-center">
                <span className="material-symbols-outlined text-[18px] mr-2">help</span>
                Frequently Asked Questions
              </a>
            </li>
          </ul>
          <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
            <p className="text-[14px] text-[#6b7280]">
              You can also reach us directly at{' '}
              <a href="mailto:supportquovex@gmail.com" className="text-[#00288e] hover:underline font-medium">
supportquovex@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

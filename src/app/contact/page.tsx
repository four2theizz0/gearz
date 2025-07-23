'use client';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useToast();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call - you can replace this with actual contact form API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      showSuccess('Message Sent!', "Thank you for your message! We'll get back to you soon.");
      setSubmitted(true);
    } catch (error) {
      showError('Message Failed', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400">Have questions about our gear? Get in touch with us!</p>
      </div>

      {submitted ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-400">Message Sent!</h2>
          <p className="text-gray-300">Thank you for your message! We&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <div className="card p-8">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6" 
            noValidate
            aria-labelledby="contact-form-title"
          >
            <h2 id="contact-form-title" className="sr-only">Contact Form</h2>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
                Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Your full name"
                autoComplete="name"
                aria-describedby="name-help"
              />
              <div id="name-help" className="sr-only">
                Enter your full name so we can address you properly
              </div>
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="your.email@example.com"
                autoComplete="email"
                aria-describedby="email-help"
              />
              <div id="email-help" className="sr-only">
                We'll use this email address to respond to your inquiry
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
                Message <span className="text-red-500" aria-label="required">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="input-field w-full resize-none"
                placeholder="Tell us about your inquiry..."
                aria-describedby="message-help"
              />
              <div id="message-help" className="text-xs text-gray-400 mt-1">
                Please provide details about your question or request
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800" 
              disabled={loading}
              aria-describedby="submit-help"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Sending Message...</span>
                  <span className="sr-only">Please wait while we send your message</span>
                </>
              ) : (
                'Send Message'
              )}
            </button>
            <div id="submit-help" className="sr-only">
              Click to send your message to our team
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 
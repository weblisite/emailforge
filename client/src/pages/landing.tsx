import { Link } from "wouter";
import { Mail, Check, ArrowRight, Star, Users, BarChart3, Zap, Shield, Target, TrendingUp, MessageSquare, Settings, HelpCircle, FileText, BookOpen, Phone, Twitter, Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EmailForge</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/create-account">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your <span className="text-blue-600">Email Marketing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            EmailForge is the ultimate B2B cold email automation platform. Build sophisticated campaigns, 
            nurture leads automatically, and scale your outreach like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-account">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="text-lg px-8 py-4 border-2">
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>Trusted by 10,000+ businesses worldwide</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to scale your email marketing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Email Automation</h3>
              <p className="text-gray-600">Create sophisticated email sequences that nurture leads automatically</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Lead Management</h3>
              <p className="text-gray-600">Organize and track your prospects with advanced CRM capabilities</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
              <p className="text-gray-600">Get detailed metrics on open rates, click-throughs, and conversions</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Smart Campaigns</h3>
              <p className="text-gray-600">AI-powered campaign optimization for better results</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Deliverability Tools</h3>
              <p className="text-gray-600">Advanced tools to ensure your emails reach the inbox</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Personalization</h3>
              <p className="text-gray-600">Dynamic content that speaks directly to each recipient</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How EmailForge Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes with our simple 4-step process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Import Your Leads</h3>
              <p className="text-gray-600">Upload your contact list or integrate with your CRM to get started quickly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Email Accounts</h3>
              <p className="text-gray-600">Configure your sending email accounts for optimal deliverability.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Campaign</h3>
              <p className="text-gray-600">Design sophisticated email sequences with our drag-and-drop builder.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Launch & Scale</h3>
              <p className="text-gray-600">Send campaigns automatically and watch your results improve over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50M+</div>
              <div className="text-gray-600">Emails Sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Deliverability Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">3.2x</div>
              <div className="text-gray-600">ROI Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EmailForge?</h2>
            <p className="text-xl text-gray-600">We're not just another email marketing platform. We're your growth partner.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Built for B2B Growth</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Advanced Lead Scoring</h4>
                    <p className="text-gray-600">Automatically identify and prioritize your hottest prospects</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Automation</h4>
                    <p className="text-gray-600">AI-powered workflows that adapt to recipient behavior</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Enterprise Security</h4>
                    <p className="text-gray-600">SOC 2 compliant with enterprise-grade security features</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Proven Results</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">95% Deliverability Rate</h4>
                    <p className="text-gray-600">Industry-leading inbox placement rates</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">3.2x ROI Improvement</h4>
                    <p className="text-gray-600">Average improvement for our customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">24/7 Expert Support</h4>
                    <p className="text-gray-600">Dedicated support team to help you succeed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">EmailForge vs. The Competition</h2>
            <p className="text-xl text-gray-600">See why leading businesses choose EmailForge over other platforms</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">EmailForge</div>
                  <div className="text-sm text-gray-600">Competitor A</div>
                  <div className="text-sm text-gray-600">Competitor B</div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Deliverability</h3>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-green-600">95%</div>
                  <div className="text-sm text-gray-600">87%</div>
                  <div className="text-sm text-gray-600">82%</div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Business Hours</div>
                  <div className="text-sm text-gray-600">Email Only</div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-green-600">$29/month</div>
                  <div className="text-sm text-gray-600">$49/month</div>
                  <div className="text-sm text-gray-600">$39/month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs. No hidden fees, no surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$29<span className="text-lg font-normal text-gray-600">/month</span></div>
              <p className="text-gray-600 mb-6">Perfect for small businesses and startups</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Up to 10,000 emails/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Up to 5,000 leads</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Basic email automation</span>
                </li>
              </ul>
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">Start Free Trial</Button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm ring-2 ring-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$79<span className="text-lg font-normal text-gray-600">/month</span></div>
              <p className="text-gray-600 mb-6">Ideal for growing businesses and marketing teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Up to 100,000 emails/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Up to 50,000 leads</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Advanced automation workflows</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics & reporting</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Free Trial</Button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
              <p className="text-gray-600 mb-6">For large organizations with complex needs</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited emails</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited leads</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Custom automation rules</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
              </ul>
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">Contact Sales</Button>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
            <p className="text-sm text-gray-500">
              Powered by{" "}
              <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Polar.sh
              </a>{" "}
              for secure payments
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied customers who've transformed their email marketing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <p className="text-gray-700 mb-6 italic">"EmailForge transformed our email marketing. Our open rates increased by 40% and conversions by 25% in just 3 months."</p>
              <div>
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-600">Marketing Director at TechFlow Inc</div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <p className="text-gray-700 mb-6 italic">"The automation features saved us hours every week. The ROI is incredible - we're scaling our email campaigns like never before."</p>
              <div>
                <div className="font-semibold text-gray-900">Michael Chen</div>
                <div className="text-gray-600">Founder at StartupXYZ</div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <p className="text-gray-700 mb-6 italic">"Best email platform we've used. The analytics are comprehensive and the deliverability tools are game-changing."</p>
              <div>
                <div className="font-semibold text-gray-900">Emily Rodriguez</div>
                <div className="text-gray-600">Growth Manager at ScaleUp Solutions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Transform Your Email Marketing?</h2>
          <Link href="/create-account">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about EmailForge</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does EmailForge improve email deliverability?</h3>
              <p className="text-gray-600">EmailForge uses advanced authentication protocols, reputation monitoring, and smart sending algorithms to ensure your emails reach the inbox instead of spam folders.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I integrate EmailForge with my existing CRM?</h3>
              <p className="text-gray-600">Yes! EmailForge offers seamless integrations with popular CRMs like Salesforce, HubSpot, Pipedrive, and more. We also provide a robust API for custom integrations.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What kind of analytics and reporting do you provide?</h3>
              <p className="text-gray-600">We provide comprehensive analytics including open rates, click-through rates, bounce rates, conversion tracking, A/B testing results, and detailed subscriber behavior insights.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer customer support?</h3>
              <p className="text-gray-600">Absolutely! We provide 24/7 customer support via live chat, email, and phone. All plans include support, with premium plans offering priority support and dedicated account managers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EmailForge</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The ultimate B2B cold email automation platform. Transform your outreach, 
                nurture leads automatically, and scale your business growth.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 EmailForge. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

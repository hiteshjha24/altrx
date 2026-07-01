import React from 'react';
import { ShieldCheck, Truck, Lock, FlaskConical, HeartHandshake, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 pb-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight z-10">
          Democratizing Healthcare with <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Accessible Alternatives
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto z-10">
          At Alt℞, our primary goal is simple: make affordable medicines available for everyone. We believe that financial constraints should never stand in the way of your health and well-being.
        </p>
      </section>

      {/* Mission & Story Section */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Your Prescription, Our Priority.</h2>
          <p className="text-gray-400 leading-relaxed">
            The cost of brand-name prescriptions can be overwhelming. We bridge the gap between high-quality healthcare and affordability by offering generic and alternative medicines that provide the exact same benefits at a fraction of the cost. 
          </p>
          <p className="text-gray-400 leading-relaxed">
            Built by Hitesh Jha, Alt℞ leverages a data-driven approach to seamlessly map expensive prescriptions to their chemically identical, budget-friendly counterparts. By integrating intelligent search and verification systems, we remove the guesswork from finding alternatives.
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <FlaskConical className="text-teal-400" />
            The Alt℞ Promise
          </h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <span><strong>Same Efficacy:</strong> All suggested alternatives share the exact same active ingredients as your prescribed brand.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <span><strong>Cost Savings:</strong> Save significantly on your monthly medical bills without compromising on quality.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <span><strong>Seamless Experience:</strong> Just upload your prescription, and our system handles the matching.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="px-6 sm:px-12 max-w-7xl mx-auto py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Trust Alt℞?</h2>
          <p className="text-gray-400">We prioritize your safety, privacy, and time above all else.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col items-center text-center hover:border-teal-900 transition-colors">
            <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="text-teal-400" size={24} />
            </div>
            <h4 className="text-white font-medium text-lg mb-2">100% Genuine Medicines</h4>
            <p className="text-gray-500 text-sm">
              We source directly from verified distributors and strictly adhere to medical standards to ensure authenticity.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col items-center text-center hover:border-teal-900 transition-colors">
            <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-teal-400" size={24} />
            </div>
            <h4 className="text-white font-medium text-lg mb-2">Secure & Private</h4>
            <p className="text-gray-500 text-sm">
              Your prescriptions and health data are encrypted end-to-end. We maintain absolute confidentiality.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col items-center text-center hover:border-teal-900 transition-colors">
            <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
              <Truck className="text-teal-400" size={24} />
            </div>
            <h4 className="text-white font-medium text-lg mb-2">Fast Delivery</h4>
            <p className="text-gray-500 text-sm">
              Health can't wait. We ensure fast, reliable delivery right to your doorstep within 30-60 mins.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 sm:px-12 max-w-4xl mx-auto py-16 text-center">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-gray-800 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to find your alternative?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of users who have switched to smarter, affordable healthcare with Alt℞.
          </p>
          <Link 
            href="/upload" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors gap-2"
          >
            Upload Prescription
          </Link>
        </div>
      </section>
    </main>
  );
}
import { Link } from 'react-router-dom';
import { Bot, Zap, Code, Shield, ArrowRight, MessageSquare, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Build Discord Bots{' '}
            <span className="text-blue-600">Without Code</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Create powerful Discord bots with our intuitive visual workflow editor.
            No coding required - just drag, drop, and deploy.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="Visual Workflow Editor"
            description="Drag and drop nodes to create complex bot behaviors. Connect triggers to actions effortlessly."
          />
          <FeatureCard
            icon={<Code className="w-12 h-12" />}
            title="All DiscordJS Features"
            description="Access every DiscordJS v14/v15 capability - from basic messaging to advanced moderation."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Secure & Reliable"
            description="Your bots run in isolated environments with enterprise-grade security and uptime."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-blue-900 text-white rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            step={1}
            icon={<MessageSquare className="w-8 h-8" />}
            title="Create Your Bot"
            description="Sign up and create your first bot with a Discord token."
          />
          <StepCard
            step={2}
            icon={<Settings className="w-8 h-8" />}
            title="Build Workflow"
            description="Use visual editor to add triggers, logic, and actions."
          />
          <StepCard
            step={3}
            icon={<Zap className="w-8 h-8" />}
            title="Deploy & Run"
            description="One-click deploy and your bot is live on Discord."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Ready to Build Your Bot?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Join thousands of creators building amazing Discord experiences.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg text-lg"
        >
          <span>Start Building Now</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({ step, icon, title, description }: { step: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold">{step}</span>
      </div>
      <div className="text-blue-200 mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  );
}

'use client';

import { Sparkles, Zap, ShieldCheck, Layers, MousePointer2 } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-28 bg-background py-6 md:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl mb-20 space-y-4 text-center md:text-left">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
            Next-Gen Platform
          </h2>
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
            Connect your team <br />
            <span className="text-muted-foreground">in a smarter way.</span>
          </h3>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed pt-4">
            We build a modern digital workspace where all conversations, ideas, and documents are
            unified in a single, seamless, and secure environment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <div className="p-8 rounded-3xl border bg-card/50 space-y-4">
            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold tracking-tight">Instant Speed</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every message, reaction, and colleague status is updated in real-time. Zero latency,
              zero waiting.
            </p>
          </div>

          <div className="p-8 rounded-3xl border bg-card/50 space-y-4">
            <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Sparkles size={24} />
            </div>
            <h4 className="text-xl font-bold tracking-tight">AI Intelligence</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Integrated AI tools help you summarize long discussion threads and assist in drafting
              professional content in seconds.
            </p>
          </div>

          <div className="p-8 rounded-3xl border bg-card/50 space-y-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xl font-bold tracking-tight">Multi-layer Security</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is protected by advanced security layers, preventing information leaks and
              ensuring absolute privacy for your organization.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex gap-6 p-8 rounded-3xl border bg-muted/20 items-start">
            <Layers className="mt-1 text-primary shrink-0" size={24} />
            <div>
              <h5 className="font-bold mb-1">Workspace Management</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Easily switch between different projects and organizations while keeping everything
                separated and organized.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-3xl border bg-muted/20 items-start">
            <MousePointer2 className="mt-1 text-primary shrink-0" size={24} />
            <div>
              <h5 className="font-bold mb-1">Powerful Editor</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send images, files, and format content intuitively, ensuring your messages are
                always clear and professional.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Powered by modern cloud infrastructure • Secure & Reliable
          </p>
        </div>
      </div>
    </section>
  );
}

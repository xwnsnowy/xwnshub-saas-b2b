'use client';

import { Zap, Bot, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs';
import { buttonVariants } from '@/components/ui/button';

const steps = [
  {
    icon: Zap,
    title: 'Break Communication Silos',
    desc: 'Move away from messy email chains. Use structured channels and threads to keep every project organized and searchable.',
    color: 'text-amber-600 dark:text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Bot,
    title: 'Accelerate with AI Support',
    desc: 'Let AI handle the noise. Automatically summarize long threads and draft messages so you can focus on decision-making.',
    color: 'text-blue-600 dark:text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'Secure Multi-tenant Access',
    desc: "Manage multiple organizations with absolute data isolation. Every workspace is a fortress for your team's intellectual property.",
    color: 'text-emerald-600 dark:text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

export function SolutionSection() {
  return (
    <section id="solution" className="bg-background py-24 md:py-32 overflow-hidden border-t">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">
                The Workflow
              </h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
                Stop chasing info. <br />
                <span className="text-muted-foreground/60">Start executing.</span>
              </h3>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="group flex gap-6 items-start transition-opacity hover:opacity-100 opacity-80 dark:opacity-70"
                >
                  <div
                    className={cn(
                      'mt-1 size-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm',
                      step.bg,
                      step.color,
                    )}
                  >
                    <step.icon size={24} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-foreground tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <LoginLink
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'group inline-flex items-center gap-3 text-foreground font-bold text-sm uppercase tracking-widest hover:text-primary transition-colors',
                )}
              >
                Explore all features
                <ArrowRight
                  size={18}
                  className="text-primary transition-transform group-hover:translate-x-2"
                />
              </LoginLink>
            </div>
          </div>

          <div className="relative">
            {/* Stylized UI Mockup */}
            <div className="relative rounded-2xl border border-border bg-card/50 p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
                <div className="size-3 rounded-full bg-red-500/40" />
                <div className="size-3 rounded-full bg-amber-500/40" />
                <div className="size-3 rounded-full bg-emerald-500/40" />
                <div className="ml-4 h-4 w-32 rounded-full bg-muted" />
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="size-8 rounded-lg bg-primary/20 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-1/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted/60" />
                  </div>
                </div>

                {/* AI Box */}
                <div className="ml-11 p-4 rounded-xl bg-primary/5 border border-primary/10 shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                      AI Assistant
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-primary/20 mb-1" />
                  <div className="h-2 w-2/3 rounded bg-primary/20" />
                </div>

                <div className="flex gap-3 opacity-40">
                  <div className="size-8 rounded-lg bg-muted shrink-0" />
                  <div className="h-3 w-1/2 rounded bg-muted/60 mt-2" />
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 animate-bounce duration-[3000ms] hidden sm:block">
              <div className="bg-popover border border-border px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-popover-foreground">Task Completed</span>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 p-6 rounded-2xl bg-card border border-border shadow-2xl hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="size-8 rounded-full border-2 border-card bg-muted" />
                  ))}
                </div>
                <div className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  +12 Active Now
                </div>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

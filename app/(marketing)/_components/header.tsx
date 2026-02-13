'use client';
import Link from 'next/link';
import { Menu, X, Cpu, Zap, LayoutDashboard, LogOut } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RegisterLink, LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import Logo from '@/public/logo.png';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const menuItems = [
  { name: 'Features', href: '#link' },
  { name: 'Solution', href: '#link' },
  { name: 'Pricing', href: '#link' },
  { name: 'About', href: '#about' },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getUser, isLoading } = useKindeBrowserClient();
  const user = getUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative">
      <nav
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-in-out px-4 py-4',
          isScrolled ? 'pt-2' : 'pt-6',
        )}
      >
        <div
          className={cn(
            'relative mx-auto transition-all duration-500 ease-cyber',
            'border border-border/40 bg-background/60 backdrop-blur-xl',
            isScrolled
              ? 'max-w-4xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-primary/10'
              : 'max-w-7xl shadow-none',
          )}
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
          }}
        >
          {/* Decorative Top Line - Đổi màu theo Primary */}
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-center justify-between px-6 py-3 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={Logo}
                    alt="logo"
                    height={34}
                    width={34}
                    className="relative z-10 rounded-sm grayscale transition-all group-hover:grayscale-0"
                  />
                  <div className="absolute -inset-1 bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h1 className="text-lg font-black italic tracking-tighter uppercase">
                  xWn
                  <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                    Snowy
                  </span>
                </h1>
              </Link>

              <ul className="hidden lg:flex items-center gap-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:bg-primary/5"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {!isLoading && (
                <div className="flex items-center gap-2">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/workspace"
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'hidden md:flex font-bold italic uppercase h-9 rounded-none bg-primary text-primary-foreground',
                        )}
                        style={{
                          clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                        }}
                      >
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                      </Link>
                      <LogoutLink
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'text-muted-foreground hover:text-destructive',
                        )}
                      >
                        <LogOut className="size-5" />
                      </LogoutLink>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LoginLink
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'hidden md:flex font-bold uppercase tracking-tight',
                        )}
                      >
                        Sign In
                      </LoginLink>
                      <RegisterLink
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'font-bold italic uppercase h-9 rounded-none',
                        )}
                        style={{
                          clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                        }}
                      >
                        Initialize <Zap className="ml-1 size-3 fill-current" />
                      </RegisterLink>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setMenuState(!menuState)}
                className="flex h-9 w-9 items-center justify-center border border-border bg-muted/50 lg:hidden"
              >
                {menuState ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute left-4 right-4 top-full mt-2 overflow-hidden bg-background/95 backdrop-blur-2xl transition-all duration-300 lg:hidden',
            menuState
              ? 'max-h-[400px] border border-border p-6 opacity-100'
              : 'max-h-0 border-none p-0 opacity-0',
          )}
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
          }}
        >
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  onClick={() => setMenuState(false)}
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-primary"
                >
                  <Cpu className="size-4 text-primary" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
            <ThemeToggle />
            {!user && (
              <RegisterLink className={cn(buttonVariants(), 'w-full rounded-none')}>
                Sign Up Now
              </RegisterLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

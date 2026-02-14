'use client';

import Link from 'next/link';
import { Menu, X, Cpu, Zap, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RegisterLink, LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import Logo from '@/public/logo.png';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'About', href: '#about' },
  { name: 'Solution', href: '#solution' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: 'https://www.linkedin.com/in/xwnsnowy-dev' },
];

const registerAuthUrlParams = {
  is_create_org: 'true',
  org_name: 'My Workspace',
  pricing_table_key: 'teamflow_plans',
};

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

  // Đóng menu khi resize lên màn hình lớn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuState(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="relative">
      <nav
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-in-out px-4',
          isScrolled ? 'py-3' : 'py-6',
        )}
      >
        <div
          className={cn(
            'relative mx-auto transition-all duration-500 ease-cyber',
            'border border-border/40 bg-background/60 backdrop-blur-xl',
            isScrolled ? 'max-w-4xl shadow-lg dark:shadow-primary/5' : 'max-w-7xl shadow-none',
          )}
          style={{
            clipPath: isScrolled
              ? 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)'
              : 'none',
          }}
        >
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

          <div className="flex items-center justify-between px-4 py-2.5 lg:px-8">
            {/* LOGO SECTION */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="relative shrink-0">
                  <Image
                    src={Logo}
                    alt="logo"
                    height={30}
                    width={30}
                    className="relative z-10 grayscale transition-all group-hover:grayscale-0 sm:h-[34px] sm:w-[34px]"
                  />
                  <div className="absolute -inset-1 bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h1 className="text-base sm:text-lg font-black italic tracking-tighter uppercase leading-none">
                  xWn<span className="text-primary">Snowy</span>
                </h1>
              </Link>

              {/* DESKTOP MENU */}
              <ul className="hidden lg:flex items-center gap-1">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {item.name === 'Pricing' ? (
                      <RegisterLink
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:bg-primary/5"
                        authUrlParams={registerAuthUrlParams}
                      >
                        {item.name}
                      </RegisterLink>
                    ) : (
                      <a
                        href={item.href}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:bg-primary/5 rounded-md"
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTION SECTION */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <div className="hidden sm:block h-6 w-[1px] bg-border/50" />

              {!isLoading && (
                <div className="flex items-center gap-2">
                  {user ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Link
                        href="/workspace"
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'hidden xs:flex font-bold italic uppercase h-8 sm:h-9 rounded-none bg-primary text-primary-foreground text-[10px] sm:text-xs',
                        )}
                        style={{
                          clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                        }}
                      >
                        <LayoutDashboard className="mr-1.5 size-3.5" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Link>
                      <LogoutLink
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'h-8 w-8 text-muted-foreground',
                        )}
                      >
                        <LogOut className="size-4 sm:size-5" />
                      </LogoutLink>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <LoginLink
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'hidden sm:flex text-[11px] font-bold uppercase',
                        )}
                      >
                        Sign In
                      </LoginLink>
                      <RegisterLink
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'font-bold italic uppercase h-8 sm:h-9 rounded-none text-[10px] sm:text-xs px-3 sm:px-4',
                        )}
                        style={{
                          clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                        }}
                        authUrlParams={registerAuthUrlParams}
                      >
                        Init <Zap className="ml-1 size-3 fill-current" />
                      </RegisterLink>
                    </div>
                  )}
                </div>
              )}

              {/* MOBILE HAMBURGER */}
              <button
                onClick={() => setMenuState(!menuState)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border border-border bg-muted/50 lg:hidden transition-colors hover:bg-primary/10"
              >
                {menuState ? (
                  <X className="size-4 sm:size-5 text-primary" />
                ) : (
                  <Menu className="size-4 sm:size-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
          {menuState && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-4 right-4 top-full mt-2 overflow-hidden bg-background/98 backdrop-blur-2xl border border-primary/20 p-6 lg:hidden shadow-2xl z-[60]"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
              }}
            >
              <div className="flex flex-col gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 opacity-70">
                    Navigation
                  </p>
                  <ul className="space-y-3">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.href}
                          onClick={() => setMenuState(false)}
                          className="flex items-center justify-between group py-2"
                        >
                          <span className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                            {item.name}
                          </span>
                          <ChevronRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Appearance
                    </span>
                    <ThemeToggle />
                  </div>
                  {!user && (
                    <LoginLink
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'w-full rounded-none border-primary/20 uppercase font-bold text-xs',
                      )}
                    >
                      Member Sign In
                    </LoginLink>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

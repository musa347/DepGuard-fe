import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BookOpen, Github, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', to: '/projects', icon: FolderKanban },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* DepGuard Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#0F172A]">DepGuard</span>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-[#64748B] -mt-1 font-medium">
                Maven Intel
              </span>
            </div>
          </NavLink>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-2 mx-4 border-t border-[#E2E8F0]" />

        {/* External / Docs Links */}
        <div className="p-3 space-y-1">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Documentation</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <Github className="w-4 h-4 shrink-0" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-mono">DepGuard Core</span>
          <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};

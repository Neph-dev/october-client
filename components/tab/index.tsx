'use client';

import { useRouter } from 'next/navigation';
import { useState } from "react";

interface TabProps {
    label: string;
    path: string;
    count?: number | null;
}

const Tab = ({ active }: { active: string; }) => {
    const route = useRouter();

    const tabsElements: TabProps[] = [
        {
            label: 'News Feed',
            path: '/feeds',
        },
        {
            label: 'Chat',
            path: '/chat',
        }
    ];

    const onClick = (tab: TabProps) => {
        route.push(tab.path);
    };

    return tabsElements.map((tab, index) => (
        <button
            key={index}
            onClick={() => onClick(tab)}
            className={`relative px-6 py-3 font-medium transition-all ${active === tab.label
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
                }`}
        >
            <span className="flex items-center gap-2">
                {tab.label}
                {tab.count && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${active === tab.label
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                        }`}>
                        {tab.count}
                    </span>
                )}
            </span>
            {active === tab.label && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            )}
        </button>
    ));
};

export default Tab;
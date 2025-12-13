'use client';

import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';

interface MenuItemProps {
    onClose: () => void;
}

const MenuItem = ({ onClose }: MenuItemProps) => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { selectedCompany, setSelectedCompany } = useCompany();

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/companies');

                if (!response.ok) {
                    throw new Error('Failed to fetch companies');
                }

                const data = await response.json();

                const companiesData = Array.isArray(data) ? data : data.companies || [];
                setCompanies(companiesData);
            } catch (error) {
                console.error('Error fetching companies:', error);
                setCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const onClick = (menu: string) => {
        onClose();
        setSelectedCompany(menu);
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-3 px-2">
                <div className="w-2 h-2 bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-500 text-xs font-mono uppercase tracking-wider">Loading...</span>
            </div>
        );
    }

    const renderCompanies = (company: any, index: number) => {
        const ticker = company.ticker || company.name?.substring(0, 3).toUpperCase();
        const isSelected = selectedCompany === company.name;

        return (
            <button
                key={company.Name || index}
                onClick={() => onClick(company.name)}
                className={`text-[12px] w-full flex items-center gap-2 px-2 py-1.5 transition-all border-l-2 ${isSelected
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'text-emerald-100/80 hover:bg-emerald-500/10 hover:text-emerald-400 border-transparent hover:border-emerald-500'
                    }`}
            >
                <span className={`w-1.5 h-1.5 ${isSelected ? 'bg-black' : 'bg-emerald-500/50'}`}></span>
                <span className="uppercase tracking-wide truncate">{company.name}</span>
                <span className={`ml-auto text-[12px] ${isSelected ? 'text-black/60' : 'text-emerald-600'}`}>
                    [{ticker}]
                </span>
            </button>
        );
    };

    return (
        <div className="font-mono text-xs">
            {/* Header */}
            <div className="px-2 py-1 border-b border-emerald-900/50 mb-1">
                <span className="text-emerald-600 uppercase tracking-widest text-[12px]">
                    ▸ Companies
                </span>
            </div>

            {/* All Companies */}
            <button
                onClick={() => onClick("All Companies")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 transition-all border-l-2 ${selectedCompany === "All Companies"
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'text-emerald-100/80 hover:bg-emerald-500/10 hover:text-emerald-400 border-transparent hover:border-emerald-400'
                    }`}
            >
                <span className={`w-1.5 h-1.5 ${selectedCompany === "All Companies" ? 'bg-black' : 'bg-emerald-500'}`}></span>
                <span className="uppercase text-[12px] tracking-wide">All</span>
                <span className="ml-auto text-[12px] opacity-60">[*]</span>
            </button>

            {/* Company List */}
            {companies.map((company, index) => renderCompanies(company, index))}

            {/* Footer */}
            <div className="px-2 py-2 border-t border-emerald-900/50 mt-2">
                <div className="flex items-center justify-between text-[12px] text-emerald-700">
                    <span>{companies.length} LISTED</span>
                    <span className="animate-pulse">●</span>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;
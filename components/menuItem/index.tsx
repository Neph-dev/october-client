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
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                <span className="ml-2 text-gray-400 text-sm">Loading companies...</span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => onClick("All Companies")}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${selectedCompany === "All Companies"
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    } rounded-lg`}
            >
                <span className="text-sm text-left">All Companies</span>
            </button>

            {companies.map((company, index) => (
                <button
                    key={company.Name || index}
                    onClick={() => onClick(company.name)}
                    className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${selectedCompany === company.name
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        } rounded-lg`}
                >
                    <span className="text-sm text-left">{company.name}</span>
                </button>
            ))}
        </>
    );
};

export default MenuItem;
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompanyContextType {
    selectedCompany: string;
    setSelectedCompany: (company: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

interface CompanyProviderProps {
    children: ReactNode;
}

export const CompanyProvider = ({ children }: CompanyProviderProps) => {
    const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');

    return (
        <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
            {children}
        </CompanyContext.Provider>
    );
};
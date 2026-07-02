'use client';

import { createContext, useContext } from 'react';

const SectionShellContext = createContext(false);

export const SectionShellProvider = SectionShellContext.Provider;
export const useSectionShell = () => useContext(SectionShellContext);

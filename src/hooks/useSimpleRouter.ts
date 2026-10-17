import { useState, useEffect, useCallback } from 'react';

const PAGES = ['home', 'clock', 'timer', 'countdown'] as const;
export type Page = (typeof PAGES)[number];

function readPageFromUrl(): Page {
    const page = new URLSearchParams(window.location.search).get('page');
    return PAGES.includes(page as Page) ? (page as Page) : 'home';
}

export function useSimpleRouter() {
    const [currentPage, setCurrentPage] = useState<Page>(readPageFromUrl);

    useEffect(() => {
        const handlePopState = () => setCurrentPage(readPageFromUrl());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = useCallback((page: Page) => {
        const url = new URL(window.location.href);
        if (page === 'home') {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page);
        }
        window.history.pushState({}, '', url);
        setCurrentPage(page);
    }, []);

    return { currentPage, navigate };
}

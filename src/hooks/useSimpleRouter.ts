import { useState, useEffect } from 'react';

type Page = 'home' | 'clock' | 'timer' | 'countdown';

export function useSimpleRouter() {
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        return ['home', 'clock', 'timer', 'countdown'].includes(page || '') ? (page as Page) : 'home';
    });

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const page = params.get('page');
            setCurrentPage(
                ['home', 'clock', 'timer', 'countdown'].includes(page || '') ? (page as Page) : 'home'
            );
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (page: Page) => {
        const url = new URL(window.location.href);
        if (page === 'home') {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page);
        }
        window.history.pushState({}, '', url.toString());
        setCurrentPage(page);
    };

    return { currentPage, navigate };
}

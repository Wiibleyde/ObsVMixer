import { useState, useEffect } from 'react';

type Route = '/' | '/clock' | '/timer' | '/countdown';

const BASE_URL = '/ObsVMixer';

export function useSimpleRouter() {
    const [currentPath, setCurrentPath] = useState<Route>(() => {
        const fullPath = window.location.pathname;
        const path = fullPath.startsWith(BASE_URL) ? fullPath.substring(BASE_URL.length) : fullPath;
        const normalizedPath = path || '/';
        return ['/', '/clock', '/timer', '/countdown'].includes(normalizedPath) ? normalizedPath as Route : '/';
    });

    useEffect(() => {
        const handlePopState = () => {
            const fullPath = window.location.pathname;
            const path = fullPath.startsWith(BASE_URL) ? fullPath.substring(BASE_URL.length) : fullPath;
            const normalizedPath = path || '/';
            setCurrentPath(['/', '/clock', '/timer', '/countdown'].includes(normalizedPath) ? normalizedPath as Route : '/');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (path: Route) => {
        const fullPath = BASE_URL + path;
        window.history.pushState({}, '', fullPath);
        setCurrentPath(path);
    };

    return { currentPath, navigate };
}

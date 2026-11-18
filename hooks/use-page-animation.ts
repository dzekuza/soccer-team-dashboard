import { useEffect, useState } from "react";

export function usePageAnimation(dependencies: unknown[] = []) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, dependencies);

    return isVisible;
}

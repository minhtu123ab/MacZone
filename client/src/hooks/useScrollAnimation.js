import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for scroll-triggered animations
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Percentage of element visibility needed to trigger (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether animation should trigger only once
 * @returns {Object} - { ref, isVisible } - Ref to attach to element and visibility state
 */
export const useScrollAnimation = (options = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

/**
 * Hook for staggered animations (useful for lists)
 * @param {number} count - Number of items to animate
 * @param {Object} options - Configuration options
 * @returns {Array} - Array of { ref, isVisible, delay } objects
 */
export const useStaggerAnimation = (count, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    staggerDelay = 100, // ms between each item animation
  } = options;

  const refs = useRef([]);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const observers = refs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index];
              }
              return prev;
            });
            observer.unobserve(ref);
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer, index) => {
        if (observer && refs.current[index]) {
          observer.unobserve(refs.current[index]);
        }
      });
    };
  }, [count, threshold, rootMargin]);

  const setRef = (index) => (el) => {
    refs.current[index] = el;
  };

  return Array.from({ length: count }, (_, index) => ({
    ref: setRef(index),
    isVisible: visibleItems.includes(index),
    delay: index * staggerDelay,
  }));
};

export default useScrollAnimation;

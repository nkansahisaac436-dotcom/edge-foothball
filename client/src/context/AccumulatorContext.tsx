import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccumulatorLeg } from '../types/index.js';

interface AccumulatorContextType {
  legs: AccumulatorLeg[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addLeg: (leg: AccumulatorLeg) => void;
  removeLeg: (id: string) => void;
  clearSlip: () => void;
  hasLeg: (id: string) => boolean;
  combinedProbability: number;
  combinedFairOdds: number;
}

const AccumulatorContext = createContext<AccumulatorContextType | undefined>(undefined);

export const AccumulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [legs, setLegs] = useState<AccumulatorLeg[]>(() => {
    try {
      const saved = localStorage.getItem('matchday_accumulator');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('matchday_accumulator', JSON.stringify(legs));
    } catch {}
  }, [legs]);

  const addLeg = (leg: AccumulatorLeg) => {
    setLegs((prev) => {
      // If already in slip, remove or don't duplicate
      if (prev.some((l) => l.id === leg.id)) {
        return prev;
      }
      return [...prev, leg];
    });
    setIsOpen(true);
  };

  const removeLeg = (id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const clearSlip = () => {
    setLegs([]);
  };

  const hasLeg = (id: string) => {
    return legs.some((l) => l.id === id);
  };

  // Combined probability: assume approximate independence for distinct matches
  const combinedProbability = legs.length > 0
    ? legs.reduce((acc, leg) => acc * leg.probability, 1.0)
    : 1.0;

  const combinedFairOdds = combinedProbability > 0.0001
    ? Number((1 / combinedProbability).toFixed(2))
    : 999.0;

  return (
    <AccumulatorContext.Provider
      value={{
        legs,
        isOpen,
        setIsOpen,
        addLeg,
        removeLeg,
        clearSlip,
        hasLeg,
        combinedProbability,
        combinedFairOdds,
      }}
    >
      {children}
    </AccumulatorContext.Provider>
  );
};

export const useAccumulator = (): AccumulatorContextType => {
  const context = useContext(AccumulatorContext);
  if (!context) {
    throw new Error('useAccumulator must be used within an AccumulatorProvider');
  }
  return context;
};

// Central theme configuration for WhatNow
// All components should use these theme values instead of hardcoded colors

export interface Theme {
  name: string;
  colors: {
    // Background gradients
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    // Card colors
    card: {
      background: string;
      border: string;
      shadow: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    // Button colors
    button: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
    };
    // Tag colors
    tag: {
      selected: string;
      selectedText: string;
      unselected: string;
      unselectedText: string;
    };
    // Status colors
    status: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
  };
}

// Current theme - will be updated with your palette suggestions
export const currentTheme: Theme = {
  name: "Soft Pastels",
  colors: {
    background: {
      primary: "bg-[#2D2D2D]",
      secondary: "bg-[#2D2D2D]", 
      tertiary: "bg-[#2D2D2D]"
    },
    card: {
      background: "bg-[#FFFFFF]",
      border: "border-[#E8E2D0]",
      shadow: "shadow-lg"
    },
    text: {
      primary: "text-[#2D2D2D]",
      secondary: "text-[#5A5A5A]",
      accent: "text-[#D4A574]"
    },
    button: {
      primary: "from-[#D4A574] to-[#C8965C]",
      primaryHover: "from-[#C8965C] to-[#B8864A]",
      secondary: "bg-[#E8E2D0]/30",
      secondaryHover: "bg-[#E8E2D0]/50"
    },
    tag: {
      selected: "bg-[#D4A574]",
      selectedText: "text-white",
      unselected: "bg-[#F8F4E6]",
      unselectedText: "text-[#2D2D2D]"
    },
    status: {
      success: "text-[#8B9A6B]",
      error: "text-[#D4A574]",
      warning: "text-[#C8965C]",
      info: "text-[#5A5A5A]"
    }
  }
};

// Theme utility functions
export const getThemeClasses = () => {
  const theme = currentTheme;
  return {
    background: `${theme.colors.background.primary} before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')] before:opacity-40 before:pointer-events-none relative`,
    card: `${theme.colors.card.background} ${theme.colors.card.border} ${theme.colors.card.shadow} rounded-3xl`,
    textPrimary: theme.colors.text.primary,
    textSecondary: theme.colors.text.secondary,
    textAccent: theme.colors.text.accent,
    buttonPrimary: `bg-gradient-to-r ${theme.colors.button.primary} text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-150 hover:brightness-110 active:scale-95`,
    buttonPrimaryHover: `hover:bg-gradient-to-r ${theme.colors.button.primaryHover}`,
    buttonSecondary: `${theme.colors.button.secondary} text-white font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-150 hover:brightness-110 active:scale-95`,
    buttonSecondaryHover: `hover:${theme.colors.button.secondaryHover}`,
    tagSelected: `${theme.colors.tag.selected} ${theme.colors.tag.selectedText} px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-150 hover:brightness-110 active:scale-95`,
    tagUnselected: `${theme.colors.tag.unselected} ${theme.colors.tag.unselectedText} px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-150 hover:brightness-110 active:scale-95`,
  };
};

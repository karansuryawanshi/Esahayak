export const bhkDbToUi = (val?: string | null) => {
  switch (val) {
    case "STUDIO": return "Studio";
    case "ONE": return "1";
    case "TWO": return "2";
    case "THREE": return "3";
    default: return "";
  }
};

export const timelineDbToUi = (val?: string | null) => {
  switch (val) {
    case "ZERO_3M": return "0-3m";
    case "THREE_6M": return "3-6m";
    case "GT_6M": return "> 6m";
    case "Exploring": return "Exploring";
    default: return "";
  }
};

export const sourceDbToUi = (val?: string | null) => {
  switch (val) {
    case "WalkIn": return "Walk-in";
    case "Call": return "Call";
    case "Referral": return "Referral";
    default: return "";
  }
};

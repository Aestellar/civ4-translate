export interface TextValue {
        text: string;
        gender?: string;     // e.g., "Male"
        plural?: string;     // e.g., "0:1"
}

export interface LogMessage {
  time: string; // or Date if you prefer
  text: string;
  fullText: string;
}
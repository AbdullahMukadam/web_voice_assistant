declare class WebVoiceAssistant {
        constructor(options: {
           geminiApiKey: string;
           model?: string;        
           maxTokens?: number;           
           temperature?: number;          
           language?: string;          
           rate?: number;
           pitch?: number;
           contextSize?: number;
           ButtonBackGroundColour?: string;
           position?: 'bottom-left' | 'bottom-right';
           buttonSize?: number;
           svgColor?: string;
           textColor?: string;
           panelHeight?: number;
           panelWidth?: number;
           PanelBackgroundColor?: string;
           MessagesBackgroundColor?: string;
           headerTextName? : string;
        });
        
    }
    
    export default WebVoiceAssistant;
    
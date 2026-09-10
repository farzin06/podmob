declare module 'react-native' {
  import * as React from 'react';

  export interface ViewStyle {
    [key: string]: any;
  }
  export interface TextStyle {
    [key: string]: any;
  }
  export interface ImageStyle {
    [key: string]: any;
  }

  export type StyleSheetNamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

  export const StyleSheet: {
    create<T extends StyleSheetNamedStyles<T> | StyleSheetNamedStyles<any>>(styles: T | StyleSheetNamedStyles<T>): T;
    flatten(style: any): any;
  };

  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const TouchableOpacity: React.FC<any>;
  export const ScrollView: React.FC<any>;
  export const SafeAreaView: React.FC<any>;
  export const ActivityIndicator: React.FC<any>;
  export const RefreshControl: React.FC<any>;
  export const Image: React.FC<any>;
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };
}

declare module 'react-native-web';

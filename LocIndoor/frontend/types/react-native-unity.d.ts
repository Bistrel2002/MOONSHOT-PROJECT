declare module '@azesmway/react-native-unity' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface UnityViewProps {
    style?: ViewStyle;
    onUnityMessage?: (message: string) => void;
    onUnityLoaded?: () => void;
    onUnityUnloaded?: () => void;
  }

  export default class UnityView extends Component<UnityViewProps> {
    postMessage(gameObject: string, methodName: string, message: string): void;
    postMessageToUnityManager(message: string): void;
    pause(): void;
    resume(): void;
  }
}

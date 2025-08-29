import UnityView from '@azesmway/react-native-unity';

export interface NavigationMessage {
  action: 'navigate' | 'getdestinations';
  category?: string;
  index?: number;
}

export interface UnityResponse {
  type: string;
  data: string;
}

export interface DestinationInfo {
  name: string;
  index: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CategoryInfo {
  categoryName: string;
  destinations: DestinationInfo[];
}

export interface DestinationsResponse {
  categories: CategoryInfo[];
}

class UnityService {
  private static instance: UnityService;
  private isUnityReady: boolean = false;
  private messageQueue: NavigationMessage[] = [];
  private responseHandlers: Map<string, (response: UnityResponse) => void> = new Map();
  private unityViewRef: any = null;

  private constructor() {}

  public static getInstance(): UnityService {
    if (!UnityService.instance) {
      UnityService.instance = new UnityService();
    }
    return UnityService.instance;
  }

  /**
   * Set the UnityView reference for communication
   */
  public setUnityViewRef(ref: any): void {
    this.unityViewRef = ref;
    console.log('UnityService: UnityView reference set');
  }

  /**
   * Initialize Unity communication
   */
  public initialize(): void {
    if (this.isUnityReady) {
      console.log('UnityService: Already initialized, skipping...');
      return;
    }

    console.log('UnityService: Initializing...');
    this.isUnityReady = true;

    // Process any queued messages
    this.processMessageQueue();
  }

  /**
   * Send a navigation request to Unity
   */
  public navigateToDestination(category: string, index: number): Promise<void> {
    const message: NavigationMessage = {
      action: 'navigate',
      category,
      index
    };

    return this.sendMessage(message);
  }

  /**
   * Load a specific Unity scene
   */
  public loadScene(sceneName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isReady()) {
        reject(new Error('Unity is not ready'));
        return;
      }

      try {
        console.log(`UnityService: Loading scene: ${sceneName}`);
        
        // Send scene load message to Unity
        if (this.unityViewRef && this.unityViewRef.postMessage) {
          const message = JSON.stringify({
            action: 'loadscene',
            sceneName: sceneName
          });
          this.unityViewRef.postMessage('UnityBridge', 'ReceiveMessageFromReactNative', message);
          
          // Set up response handler for scene loading
          const handlerId = `scene_load_${Date.now()}`;
          this.responseHandlers.set(handlerId, (response: any) => {
            if (response.type === 'scene_loaded') {
              try {
                const data = JSON.parse(response.data);
                if (data.scene_name === sceneName) {
                  console.log(`UnityService: Scene ${sceneName} loaded successfully`);
                  resolve();
                }
              } catch (e) {
                console.log(`UnityService: Scene loaded (couldn't parse scene name)`);
                resolve(); // Assume success if we get scene_loaded
              }
            } else if (response.type === 'scene_load_error') {
              reject(new Error(response.data || 'Failed to load scene'));
            }
            this.responseHandlers.delete(handlerId);
          });

          // Set timeout for scene loading
          setTimeout(() => {
            if (this.responseHandlers.has(handlerId)) {
              this.responseHandlers.delete(handlerId);
              reject(new Error(`Timeout loading scene: ${sceneName}`));
            }
          }, 10000); // 10 second timeout

        } else {
          reject(new Error('Unity postMessage method not available'));
        }
      } catch (error) {
        console.error('UnityService: Error loading scene:', error);
        reject(error);
      }
    });
  }

  /**
   * Request destinations list from Unity
   */
  public getDestinations(): Promise<DestinationsResponse> {
    const message: NavigationMessage = {
      action: 'getdestinations'
    };

    return new Promise((resolve, reject) => {
      // Set up response handler
      const handlerId = `destinations_${Date.now()}`;
      this.responseHandlers.set(handlerId, (response: UnityResponse) => {
        if (response.type === 'destinations_list') {
          try {
            const destinations: DestinationsResponse = JSON.parse(response.data);
            resolve(destinations);
          } catch (error) {
            reject(new Error('Failed to parse destinations response'));
          }
        } else if (response.type === 'destinations_error') {
          reject(new Error(response.data));
        } else {
          reject(new Error(`Unexpected response type: ${response.type}`));
        }
        this.responseHandlers.delete(handlerId);
      });

      // Send message with timeout
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(handlerId);
        reject(new Error('Timeout waiting for destinations response'));
      }, 5000);

      this.sendMessage(message).then(() => {
        // Clear timeout when message is sent successfully
        clearTimeout(timeout);
      }).catch((error) => {
        clearTimeout(timeout);
        this.responseHandlers.delete(handlerId);
        reject(error);
      });
    });
  }

  /**
   * Send a message to Unity
   */
  private async sendMessage(message: NavigationMessage): Promise<void> {
    let messageJson: string = '';
    try {
      messageJson = JSON.stringify(message);
      console.log('UnityService: Sending message to Unity:', messageJson);

      if (!this.isUnityReady) {
        // Queue message if Unity isn't ready
        this.messageQueue.push(message);
        console.log('UnityService: Unity not ready, message queued');
        return;
      }

      // Check if UnityView reference is available
      if (!this.unityViewRef) {
        console.error('UnityService: UnityView reference not set');
        throw new Error('UnityView reference not set - call setUnityViewRef first');
      }

      // Check if postMessage method exists (use the standard postMessage method)
      if (!this.unityViewRef.postMessage) {
        console.error('UnityService: postMessage method not found on UnityView');
        throw new Error('Unity module not properly initialized - missing postMessage method');
      }

      // Send message to Unity using the standard postMessage method
      // Send to UnityBridge GameObject which will handle the message
      console.log('UnityService: Calling postMessage with:', messageJson);
      this.unityViewRef.postMessage('UnityBridge', 'ReceiveMessageFromReactNative', messageJson);
      console.log('UnityService: Message sent to Unity successfully');
    } catch (error) {
      console.error('UnityService: Error sending message to Unity:', error);
      console.error('UnityService: UnityView state:', {
        hasUnityViewRef: !!this.unityViewRef,
        hasPostMessageMethod: !!(this.unityViewRef && this.unityViewRef.postMessage),
        message: messageJson || 'undefined'
      });
      throw error;
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`UnityService: Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach(message => {
      this.sendMessage(message).catch(error => {
        console.error('UnityService: Failed to send queued message:', error);
      });
    });
  }

  /**
   * Handle response from Unity
   */
  public handleUnityResponse(responseJson: string): void {
    try {
      const response: UnityResponse = JSON.parse(responseJson);
      console.log('UnityService: Received response from Unity:', response);

      // Check if we have a handler for this response type
      if (this.responseHandlers.has(response.type)) {
        const handler = this.responseHandlers.get(response.type);
        if (handler) {
          handler(response);
        }
      } else {
        console.log('UnityService: No handler found for response type:', response.type);
      }
      
      // Handle general Unity responses
      this.responseHandlers.forEach((handler, key) => {
        if (key.startsWith('scene_load_') && response.type === 'scene_loaded') {
          handler(response);
        }
      });
    } catch (error) {
      console.error('UnityService: Error parsing Unity response:', error);
    }
  }

  /**
   * Set a custom response handler (for testing/debugging)
   */
  public setResponseHandler(handler: (responseJson: string) => void): void {
    this.handleUnityResponse = handler;
  }

  /**
   * Check if Unity is ready
   */
  public isReady(): boolean {
    return this.isUnityReady && !!this.unityViewRef;
  }

  /**
   * Reset Unity connection
   */
  public reset(): void {
    this.isUnityReady = false;
    this.unityViewRef = null;
    this.messageQueue = [];
    this.responseHandlers.clear();
    console.log('UnityService: Reset Unity connection');
  }
}

export default UnityService.getInstance();

# Moonshot

I am excited to present to you a moonshot project aimed at creating indoor navigation through innovative technology.

# Problem Addressed:

<aside>
⚠️ One year ago, when I was coming to France, my first plane stopped at CASABLANCA(Airport) in Morocco, I was unable to find myself and know where precisely I was supposed to go, I got helped by a Woman who was sitting right beside me in the first plane, secondly, last summer holidays I was at Rennes, and I encountered a similar problem when I entered inside a mall, I was looking for a McDo but I was unable to know where precisely it was located in the mall, and finally I left the place and went back home. This problem of indoor navigation I thought it was just a problem for me but, after questioning family members and friends almost all of them had issues with indoor navigation. My project aims to tackle this challenge by implementing a cutting-edge navigation solution that seamlessly integrates with existing infrastructure while providing intuitive and precise user guidance.
</aside>

# Solution

### Line-Based Floor Navigation with AR Integration.

I propose implementing marker-based floor navigation with augmented reality (AR) overlays to guide users within indoor spaces. Inspired by the intuitive navigation style seen in racing video games(Forza Horizon 4 and 5), users will be able to select their destination from the map interface of the application, prompting a directional line to appear on the floor, guiding them seamlessly to their chosen location. This innovative approach eliminates the need for traditional turn-by-turn directions and instead provides users with a clear visual path overlaid with the real-world environment.

### Technology Stack:

1. **AR Development Platform: Unity AR Foundation**
    
    Unity AR Foundation provides a unified interface that allows developers to build AR applications that can run on both iOS and Android devices, streamlining development and ensuring compatibility.
    
2. **Line-Based AR Library: Vectrosity**
    
    By integrating Vectrosity into the Unity project, I can easily implement Line-Based Floor Navigation with AR integration, drawing virtual lines on the floor to guide users to their destinations. Additionally, Vectrosity offers performance optimizations, which can be beneficial for AR applications running on mobile devices.
    
3. **Integration with GPS and Sensors for Accuracy:**
- **GPS Integration:**
    - Android Location API (for Android) / iOS Core Location Framework (for iOS)
    - Leveraging the built-in location services provided by Android and iOS simplifies the integration of GPS data into the navigation system.
- **Sensor Fusion:**
    - Android Sensor API (for Android) / iOS Core Motion Framework (for iOS)
    - Utilizing the sensor APIs native to Android and iOS devices ensures seamless integration of accelerometer and gyroscope data for precise user movement tracking.

For the first phase, I will focus solely on developing the Android app. Once completed, I will proceed with integrating IOS.

**Implementation Approach:** The project will be implemented using a combination of AR development platforms and tools to ensure compatibility and scalability. By leveraging Unity AR Foundation, ARCore, Vectrosity, and ARToolkit, I will create a robust navigation solution that can cater to a wide range of devices.

In conclusion, the line-based navigation project with AR integration presents a forward-thinking solution to the challenges of indoor navigation. By harnessing the power of emerging technologies such as AR, GPS integration, and sensor fusion, I aim to provide users with a seamless and intuitive navigation experience, ultimately improving efficiency and enhancing user satisfaction.

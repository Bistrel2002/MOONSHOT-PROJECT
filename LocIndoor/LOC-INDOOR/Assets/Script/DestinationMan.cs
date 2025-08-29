using UnityEngine;
using System.Collections.Generic;

public class DestinationManager : MonoBehaviour
{
    [System.Serializable]
    public class Category
    {
        public string categoryName;
        public List<Transform> destinations = new();
    }

    public List<Category> categories = new List<Category>();
    public ArrowPathRenderer pathRenderer;
    
    [Header("AR Navigation Settings")]
    [Tooltip("Fixed starting point for navigation (leave null to use camera position once)")]
    public Transform fixedStartPoint;
    
    private Transform cachedStartPoint;

    void Start()
    {
        // Only create demo categories if no categories are configured in the Inspector
        if (categories == null || categories.Count == 0)
        {
            Debug.Log("DestinationManager: No categories found in Inspector, creating demo categories...");
            
            // --- Create demo categories + destinations ---
            CreateCategoryWithDestinations("Food", new Vector3[] {
                new Vector3(3,0,5),   // Pizza
                new Vector3(6,0,8)    // Cafeteria
            });

            CreateCategoryWithDestinations("Rooms", new Vector3[] {
                new Vector3(-4,0,10), // Room A
                new Vector3(-8,0,15)  // Room B
            });

            CreateCategoryWithDestinations("Facilities", new Vector3[] {
                new Vector3(10,0,2),  // Gym
                new Vector3(12,0,6)   // Library
            });

            CreateCategoryWithDestinations("Services", new Vector3[] {
                new Vector3(2,0,-5),  // Reception
                new Vector3(6,0,-10)  // Help Desk
            });

            CreateCategoryWithDestinations("Studies", new Vector3[] {
                new Vector3(-3,0,-8), // Lab
                new Vector3(-6,0,-12) // Classroom
            });
        }
        else
        {
            Debug.Log($"DestinationManager: Using {categories.Count} categories configured in Inspector");
            
            // Log existing categories for debugging
            foreach (var cat in categories)
            {
                Debug.Log($"  Category: '{cat.categoryName}' with {cat.destinations.Count} destinations");
                for (int i = 0; i < cat.destinations.Count; i++)
                {
                    if (cat.destinations[i] != null)
                        Debug.Log($"    Destination {i}: {cat.destinations[i].name} at {cat.destinations[i].position}");
                    else
                        Debug.LogWarning($"    Destination {i}: NULL REFERENCE!");
                }
            }
        }
    }

    private void CreateCategoryWithDestinations(string name, Vector3[] positions)
    {
        Category cat = new Category { categoryName = name };
        foreach (var pos in positions)
        {
            GameObject dest = new GameObject($"{name}_Dest");
            dest.transform.position = pos;
            cat.destinations.Add(dest.transform);
        }
        categories.Add(cat);
    }

    public void SetDestination(string category, int index)
    {
        var cat = categories.Find(c => c.categoryName == category);
        if (cat != null && index >= 0 && index < cat.destinations.Count)
        {
            // Use fixed start point or cache camera position at first call
            Transform startPoint = GetStableStartPoint();

            pathRenderer.waypoints = new Transform[]
            {
                startPoint,
                cat.destinations[index]
            };

            // Use ForceRenderPath to ensure path is rendered even if locked
            pathRenderer.ForceRenderPath();
            Debug.Log($"Navigation path set from {startPoint.position} to {cat.destinations[index].position}");
        }
        else
        {
            Debug.LogWarning($"No destination found for {category} at index {index}");
        }
    }
    
    /// <summary>
    /// Gets a stable starting point that won't change when the camera rotates
    /// </summary>
    private Transform GetStableStartPoint()
    {
        // Option 1: Use a fixed start point if assigned in Inspector
        if (fixedStartPoint != null)
        {
            return fixedStartPoint;
        }
        
        // Option 2: Cache the camera position on first call
        if (cachedStartPoint == null)
        {
            // Create a fixed point based on current camera position
            GameObject startObj = new GameObject("AR_StartPoint");
            startObj.transform.position = Camera.main.transform.position;
            startObj.transform.rotation = Quaternion.identity; // Keep neutral rotation
            cachedStartPoint = startObj.transform;
            
            Debug.Log($"Created fixed start point at: {cachedStartPoint.position}");
        }
        
        return cachedStartPoint;
    }
    
    /// <summary>
    /// Call this to reset the start point (useful when user moves significantly)
    /// </summary>
    public void ResetStartPoint()
    {
        if (cachedStartPoint != null)
        {
            DestroyImmediate(cachedStartPoint.gameObject);
            cachedStartPoint = null;
            Debug.Log("Start point reset - will be recalculated on next navigation");
        }
    }
    
    /// <summary>
    /// Get a list of all categories and their destinations for external use
    /// </summary>
    public List<Category> GetAllCategories()
    {
        return categories;
    }
    
    /// <summary>
    /// Get a specific category by name
    /// </summary>
    public Category GetCategory(string categoryName)
    {
        return categories.Find(c => c.categoryName == categoryName);
    }
    
    /// <summary>
    /// Get a destination by category name and index
    /// </summary>
    public Transform GetDestination(string categoryName, int index)
    {
        var category = GetCategory(categoryName);
        if (category != null && index >= 0 && index < category.destinations.Count)
        {
            return category.destinations[index];
        }
        return null;
    }
    
    /// <summary>
    /// Check if a category exists
    /// </summary>
    public bool HasCategory(string categoryName)
    {
        return categories.Exists(c => c.categoryName == categoryName);
    }
    
    /// <summary>
    /// Get the count of destinations in a category
    /// </summary>
    public int GetDestinationCount(string categoryName)
    {
        var category = GetCategory(categoryName);
        return category?.destinations.Count ?? 0;
    }
}

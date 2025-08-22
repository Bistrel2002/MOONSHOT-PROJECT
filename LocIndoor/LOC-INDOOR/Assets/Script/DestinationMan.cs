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
            Transform player = Camera.main.transform; // AR start point

            pathRenderer.waypoints = new Transform[]
            {
                player,
                cat.destinations[index]
            };

            pathRenderer.RenderPathFromWaypoints();
        }
        else
        {
            Debug.LogWarning($"No destination found for {category} at index {index}");
        }
    }
}

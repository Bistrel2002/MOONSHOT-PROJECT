using UnityEngine;

public class DestinationUI : MonoBehaviour
{
    public DestinationManager destinationManager;

    private string selectedCategory = null;

    void OnGUI()
    {
        // Set a simple UI style
        GUIStyle headerStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = 20,
            fontStyle = FontStyle.Bold,
            normal = { textColor = Color.white }
        };

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button)
        {
            fontSize = 16,
            alignment = TextAnchor.MiddleCenter
        };

        GUILayout.BeginArea(new Rect(20, 20, 300, Screen.height - 40));
        GUILayout.Label("Select a Destination", headerStyle);

        // If no category chosen → show category buttons
        if (selectedCategory == null)
        {
            foreach (var cat in destinationManager.categories)
            {
                if (GUILayout.Button(cat.categoryName, buttonStyle, GUILayout.Height(40)))
                {
                    selectedCategory = cat.categoryName; // choose category
                }
            }
        }
        else
        {
            // Show destinations inside selected category
            var cat = destinationManager.categories.Find(c => c.categoryName == selectedCategory);
            if (cat != null)
            {
                GUILayout.Label($"{cat.categoryName} Destinations", headerStyle);

                for (int i = 0; i < cat.destinations.Count; i++)
                {
                    if (GUILayout.Button(cat.destinations[i].name, buttonStyle, GUILayout.Height(35)))
                    {
                        destinationManager.SetDestination(selectedCategory, i);
                    }
                }
            }

            // Back button
            if (GUILayout.Button("← Back", buttonStyle, GUILayout.Height(30)))
            {
                selectedCategory = null;
            }
        }

        GUILayout.EndArea();
    }
}

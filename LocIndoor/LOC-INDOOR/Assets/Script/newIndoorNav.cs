using UnityEngine;
using UnityEngine.AI;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.XR.ARFoundation;
using Unity.AI.Navigation;

public class newIndoorNav : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private ARTrackedImageManager m_TrackedImageManager;
    [SerializeField] private GameObject trackedImagePrefab;
    [SerializeField] private LineRenderer lineRenderer;
    
    [Header("Line Renderer Settings")]
    [SerializeField] private Material lineMaterial;
    [SerializeField] private Color lineColor = new Color(0f, 1f, 0f, 1f); // Bright green (00FF00)
    [SerializeField] private float lineWidth = 0.1f;

    private GameObject navigationBase;
    private List<NavigationTarget> navigationTargets = new List<NavigationTarget>();
    private NavMeshSurface navMeshSurface;
    private NavMeshPath navMeshPath;

    private void Start()
    {
        navMeshPath = new NavMeshPath();
        Screen.sleepTimeout = SleepTimeout.NeverSleep;
        
        if (lineRenderer == null)
        {
            Debug.LogError("Line Renderer is not assigned!");
        }
        else
        {
            Debug.Log("Line Renderer is assigned. Width: " + lineRenderer.widthMultiplier);
            Debug.Log("Line Renderer material: " + (lineRenderer.material != null ? lineRenderer.material.name : "null"));
            Debug.Log("Line Renderer positions: " + lineRenderer.positionCount);
            
            // Create and assign material if not assigned
            if (lineMaterial == null)
            {
                Debug.Log("Creating default line material");
                lineMaterial = new Material(Shader.Find("Unlit/Color"));
                lineMaterial.color = lineColor;
            }
            
            // Apply material and settings
            lineRenderer.material = lineMaterial;
            lineRenderer.startWidth = lineWidth;
            lineRenderer.endWidth = lineWidth;
            lineRenderer.startColor = lineColor;
            lineRenderer.endColor = lineColor;
            
            // Test line renderer
            lineRenderer.positionCount = 2;
            lineRenderer.SetPosition(0, Vector3.zero);
            lineRenderer.SetPosition(1, new Vector3(0, 0, 5));
            
            Debug.Log("Line renderer configured with material: " + lineMaterial.name);
        }
    }

    private void Update()
    {
        if(navigationBase != null && navigationTargets.Count > 0 && navMeshSurface != null)
        {
            NavMesh.CalculatePath(player.position, navigationTargets[0].transform.position, NavMesh.AllAreas, navMeshPath);

            if(navMeshPath.status == NavMeshPathStatus.PathComplete)
            {
                lineRenderer.positionCount = navMeshPath.corners.Length;
                lineRenderer.SetPositions(navMeshPath.corners);
                
                // Debug path information
                Debug.Log("Path calculated with " + navMeshPath.corners.Length + " points");
                if (navMeshPath.corners.Length > 0)
                {
                    Debug.Log("First point: " + navMeshPath.corners[0]);
                    Debug.Log("Last point: " + navMeshPath.corners[navMeshPath.corners.Length - 1]);
                }
            }
            else
            {
                lineRenderer.positionCount = 0;
                Debug.LogWarning("Path not complete. Status: " + navMeshPath.status);
            }
        }
        else
        {
            // Debug why path calculation is skipped
            if (navigationBase == null)
                Debug.Log("Navigation base is null");
            if (navigationTargets.Count == 0)
                Debug.Log("No navigation targets found");
            if (navMeshSurface == null)
                Debug.Log("NavMeshSurface is null");
        }
    }

    private void OnEnable()
    {
        if (m_TrackedImageManager != null)
        {
            m_TrackedImageManager.trackablesChanged.AddListener(OnTrackablesChanged);
        }
    }

    private void OnDisable()
    {
        if (m_TrackedImageManager != null)
        {
            m_TrackedImageManager.trackablesChanged.RemoveListener(OnTrackablesChanged);
        }
    }

    private void OnTrackablesChanged(ARTrackablesChangedEventArgs<ARTrackedImage> eventArgs)
    {
        foreach (var newImage in eventArgs.added)
        {
            navigationBase = GameObject.Instantiate(trackedImagePrefab);

            navigationTargets.Clear();
            navigationTargets = navigationBase.transform.GetComponentsInChildren<NavigationTarget>().ToList();
            navMeshSurface = navigationBase.GetComponentInChildren<NavMeshSurface>();
            
            Debug.Log("Navigation base created. Targets: " + navigationTargets.Count);
            if (navMeshSurface == null)
                Debug.LogError("NavMeshSurface not found in prefab!");
        }
        
        foreach (var updatedImage in eventArgs.updated)
        {
            if (navigationBase != null)
            {
                navigationBase.transform.SetPositionAndRotation(updatedImage.transform.position, Quaternion.Euler(0, updatedImage.transform.rotation.eulerAngles.y, 0));
            }
        }
        
        foreach (var removedImage in eventArgs.removed)
        {
            Debug.Log("Tracked image removed");
        }
    }
}

using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

[RequireComponent(typeof(LineRenderer))]
public class ArrowPathRenderer : MonoBehaviour
{
    [Header("References")]
    public GameObject arrowPrefab;                 
    public Transform[] waypoints;                 

    [Header("Placement")]
    [Tooltip("Meters between arrows")]
    public float arrowSpacing = 0.5f;
    [Tooltip("Lift arrows/line off the floor to avoid z-fighting")]
    public float yOffset = 0.02f;
    [Tooltip("Extra Euler rotation to fix model forward (if it doesn't face +Z)")]
    public Vector3 modelRotationOffsetEuler = Vector3.zero;

    [Header("Ground Snap")]
    public bool alignToGround = true;
    public LayerMask groundMask;                   
    public float groundRaycastHeight = 0.5f;
    
    [Header("AR Stability")]
    [Tooltip("Prevents path from being recalculated automatically on transform changes")]
    public bool lockPathAfterRender = true;

    [Header("Base Line (red)")]
    public Material baseLineMaterial;             
    public float baseLineWidth = 0.05f;
    public bool drawBaseLine = true;

    private LineRenderer lr;
    private readonly List<GameObject> spawnedArrows = new();
    private readonly List<Vector3> bakedPoints = new();
    private bool pathLocked = false;

    void Awake()
    {
        Debug.Log("ArrowPathRenderer: Awake called - looking for LineRenderer...");
        
        lr = GetComponent<LineRenderer>();
        if (lr == null)
        {
            Debug.LogError("ArrowPathRenderer: LineRenderer not found in Awake!");
            return;
        }
        
        Debug.Log("ArrowPathRenderer: LineRenderer found successfully!");
        
        lr.useWorldSpace = true;
        lr.shadowCastingMode = ShadowCastingMode.Off;
        lr.receiveShadows = false;
        lr.numCapVertices = 8;

        if (baseLineMaterial != null)
            lr.material = baseLineMaterial;

        lr.widthMultiplier = baseLineWidth;
        
        Debug.Log("ArrowPathRenderer: LineRenderer configured successfully!");
    }

    void Start()
    {
        // If no waypoints were assigned, make a quick demo path
        if (waypoints == null || waypoints.Length < 2)
        {
            waypoints = new Transform[4];
            for (int i = 0; i < waypoints.Length; i++)
            {
                var wp = new GameObject($"WP_{i}").transform;
                wp.position = new Vector3(0f + i * 1.2f, 0f, i * 2f);
                waypoints[i] = wp;
            }
        }

        RenderPathFromWaypoints();
    }

    // Public API: call this if you change waypoints at runtime
    public void RenderPathFromWaypoints()
    {
        Debug.Log($"ArrowPathRenderer: RenderPathFromWaypoints called. lr is null: {lr == null}");
        
        // Check if LineRenderer is available
        if (lr == null)
        {
            Debug.LogError("ArrowPathRenderer: LineRenderer is null! Cannot render path.");
            Debug.LogError("ArrowPathRenderer: This GameObject has LineRenderer: " + (GetComponent<LineRenderer>() != null));
            Debug.LogError("ArrowPathRenderer: GameObject name: " + gameObject.name);
            return;
        }
        
        if (waypoints == null || waypoints.Length < 2)
        {
            Debug.LogWarning("ArrowPathRenderer: No waypoints available for path rendering.");
            return;
        }
        
        if (arrowPrefab == null)
        {
            Debug.LogWarning("ArrowPathRenderer: No arrow prefab assigned. Path will render without arrows.");
        }
        
        // If path is locked for AR stability, don't recalculate
        if (lockPathAfterRender && pathLocked)
        {
            Debug.Log("ArrowPathRenderer: Path is locked for AR stability - skipping recalculation");
            return;
        }

        try
        {
            // Build a dense list of points along segments
            BakePoints();

            // 1) Base line
            if (drawBaseLine && lr != null)
            {
                lr.positionCount = bakedPoints.Count;
                lr.SetPositions(bakedPoints.ToArray());
            }
            else if (lr != null)
            {
                lr.positionCount = 0;
            }

            // 2) Arrows
            ClearArrows();
            PlaceArrows();
            
            // Lock the path after first render for AR stability
            if (lockPathAfterRender)
            {
                pathLocked = true;
                Debug.Log("ArrowPathRenderer: Path locked for AR stability");
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ArrowPathRenderer: Error rendering path: {e.Message}");
            Debug.LogError($"ArrowPathRenderer: Stack trace: {e.StackTrace}");
        }
    }
    
    /// <summary>
    /// Force unlock and re-render the path (call when setting new destination)
    /// </summary>
    public void ForceRenderPath()
    {
        pathLocked = false;
        RenderPathFromWaypoints();
    }
    
    /// <summary>
    /// Clear the current path and unlock for new rendering
    /// </summary>
    public void ClearPath()
    {
        pathLocked = false;
        ClearArrows();
        if (lr != null)
        {
            lr.positionCount = 0;
        }
        bakedPoints.Clear();
        Debug.Log("ArrowPathRenderer: Path cleared and unlocked");
    }

    private void BakePoints()
    {
        bakedPoints.Clear();

        for (int i = 0; i < waypoints.Length - 1; i++)
        {
            Vector3 p0 = i > 0 ? waypoints[i - 1].position : waypoints[i].position;
            Vector3 p1 = waypoints[i].position;
            Vector3 p2 = waypoints[i + 1].position;
            Vector3 p3 = (i + 2 < waypoints.Length) ? waypoints[i + 2].position : waypoints[i + 1].position;

            int steps = Mathf.CeilToInt(Vector3.Distance(p1, p2) / arrowSpacing) * 5; // denser samples
            for (int s = 0; s <= steps; s++)
            {
                float t = s / (float)steps;
                Vector3 pos = CatmullRom(p0, p1, p2, p3, t);
                pos = SnapToGround(pos);
                bakedPoints.Add(pos + Vector3.up * yOffset);
            }
        }
    }

    // Catmull-Rom spline equation
    private Vector3 CatmullRom(Vector3 p0, Vector3 p1, Vector3 p2, Vector3 p3, float t)
    {
        float t2 = t * t;
        float t3 = t2 * t;

        return 0.5f * (
            (2f * p1) +
            (-p0 + p2) * t +
            (2f * p0 - 5f * p1 + 4f * p2 - p3) * t2 +
            (-p0 + 3f * p1 - 3f * p2 + p3) * t3
        );
    }


    private void PlaceArrows()
    {
        if (bakedPoints.Count == 0) return;

        // Step forward along baked points by spacing
        float travel = 0f;
        for (int i = 1; i < bakedPoints.Count; i++)
        {
            Vector3 prev = bakedPoints[i - 1];
            Vector3 curr = bakedPoints[i];
            float seg = Vector3.Distance(prev, curr);
            travel += seg;

            if (travel >= arrowSpacing)
            {
                travel = 0f;

                Vector3 dir = (curr - prev).normalized;
                Quaternion rot = Quaternion.LookRotation(dir, Vector3.up) *
                                 Quaternion.Euler(modelRotationOffsetEuler);

                var arrow = Instantiate(arrowPrefab, curr, rot, transform);
                spawnedArrows.Add(arrow);
            }
        }
    }

    private Vector3 SnapToGround(Vector3 p)
    {
        if (!alignToGround) return new Vector3(p.x, p.y, p.z);

        Vector3 origin = p + Vector3.up * groundRaycastHeight;
        if (Physics.Raycast(origin, Vector3.down, out var hit, groundRaycastHeight * 2f, groundMask))
            return hit.point;

        return p; // fallback if no ground hit
    }

    private void ClearArrows()
    {
        foreach (var go in spawnedArrows)
            if (go) Destroy(go);
        spawnedArrows.Clear();
    }
}

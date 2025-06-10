using System.Linq;
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class BeaconLocalizer : MonoBehaviour
{
    [Tooltip("Time-constant (seconds) for exponential smoothing of the position estimate.")]
    [Range(0.01f, 5f)]
    public float smoothingTime = 0.2f;

    [Tooltip("Maximum distance (metres) the agent is allowed to be teleported by the localizer in one frame. Set to zero to disable warping altogether.")]
    public float maxWarpDistance = 0.5f;

    public enum SolverType { WeightedAverage, LeastSquares }
    [Tooltip("Choose the position-estimation algorithm.")]
    public SolverType solver = SolverType.LeastSquares;

    public bool debugDraw = true;

    private VirtualBeacon[] _beacons;
    private NavMeshAgent _agent;

    private Vector3 _smoothedPosition;

    void Awake()
    {
 
#if UNITY_2023_1_OR_NEWER
        _beacons = FindObjectsByType<VirtualBeacon>(FindObjectsSortMode.None);
#else
        _beacons = FindObjectsOfType<VirtualBeacon>();
#endif
        if (_beacons.Length < 3)
        {
            Debug.LogWarning("BeaconLocalizer: Fewer than three beacons found – position estimation will be unreliable.");
        }

        _agent = GetComponent<NavMeshAgent>();
        _smoothedPosition = transform.position;
    }

    void Start()
    {
        // Initialize smoothed position to current location, like a GPS device starting up
        // Don't warp initially - let the agent start where it was placed in the scene
        _smoothedPosition = transform.position;
        Debug.Log($"BeaconLocalizer: GPS system initialized at position: {transform.position}");
        Debug.Log($"BeaconLocalizer: Found {_beacons.Length} beacons for triangulation");
    }

    void Update()
    {
        if (_beacons.Length == 0) return;

        Vector3 rawEstimate = solver == SolverType.WeightedAverage ? EstimateWeightedAverage() : EstimateLeastSquares();

        // Validate the estimate - if it's too far from current position, something is wrong
        float estimateDistance = Vector3.Distance(rawEstimate, transform.position);
        if (estimateDistance > 20f) // More than 20m means bad beacon placement
        {
            Debug.LogWarning($"BeaconLocalizer: Estimate {rawEstimate} is {estimateDistance:F1}m away from agent {transform.position}. Check beacon placement!");
            rawEstimate = transform.position; // Fall back to current position
        }

        // Debug logging to see what's happening
        if (Time.frameCount % 60 == 0) // Log every 60 frames to avoid spam
        {
            Debug.Log($"BeaconLocalizer: Agent at {transform.position}, Beacon estimate: {rawEstimate}, Distance: {estimateDistance:F2}m");
            
            // Show what each beacon is reporting
            for (int i = 0; i < _beacons.Length; i++)
            {
                float distance = _beacons[i].GetDistance(transform.position);
                Debug.Log($"  Beacon {i} at {_beacons[i].transform.position} reports distance: {distance:F2}m");
            }
        }

        // Exponential smoothing so the avatar does not jitter too much.
        float k = 1f - Mathf.Exp(-Time.deltaTime / smoothingTime);
        _smoothedPosition = Vector3.Lerp(_smoothedPosition, rawEstimate, k);

        // Teleport only if the agent is idle; "Warp" resets the current path, so we must avoid calling it
        // while the agent is in the middle of navigating to a destination.
        bool agentIsNavigating = _agent.hasPath && 
                                (_agent.pathStatus == UnityEngine.AI.NavMeshPathStatus.PathComplete || 
                                 _agent.pathStatus == UnityEngine.AI.NavMeshPathStatus.PathPartial) &&
                                _agent.remainingDistance > _agent.stoppingDistance;
        
        // Also check if agent is actively moving (velocity check)
        bool agentIsMoving = _agent.velocity.magnitude > 0.1f;
        
        bool shouldWarp = !agentIsNavigating && !agentIsMoving;
        
        // TEMPORARY: Disable all warping for testing
        shouldWarp = false;
        
        if (Time.frameCount % 30 == 0) // Debug log more frequently
        {
            Debug.Log($"BeaconLocalizer: hasPath={_agent.hasPath}, pathStatus={_agent.pathStatus}, remainingDistance={_agent.remainingDistance:F2}, velocity={_agent.velocity.magnitude:F2}, shouldWarp={shouldWarp}");
            Debug.Log($"BeaconLocalizer: agentIsNavigating={agentIsNavigating}, agentIsMoving={agentIsMoving}");
        }
        
        if (shouldWarp)
        {
            NavMeshHit hit;
            if (NavMesh.SamplePosition(_smoothedPosition, out hit, 2.0f, NavMesh.AllAreas))
            {
                if (maxWarpDistance <= 0f || Vector3.Distance(transform.position, hit.position) <= maxWarpDistance)
                {
                    _agent.Warp(hit.position);
                    if (Vector3.Distance(transform.position, hit.position) > 0.1f)
                    {
                        Debug.Log($"BeaconLocalizer: Warped agent from {transform.position} to {hit.position}");
                    }
                }
                else
                {
                    Debug.Log($"BeaconLocalizer: Warp distance {Vector3.Distance(transform.position, hit.position):F2}m exceeds limit {maxWarpDistance}m");
                }
            }
        }
    }

    #region Estimation algorithms

    /// <summary>
    /// Estimates the device position by taking a weighted average of all beacon positions.
    /// Weight = 1 / measured distance. Works surprisingly well for small green-field demos.
    /// </summary>
    private Vector3 EstimateWeightedAverage()
    {
        float weightSum = 0f;
        float sumX = 0f;
        float sumZ = 0f;

        foreach (var b in _beacons)
        {
            float d = b.GetDistance(transform.position);
            float w = 1f / Mathf.Max(0.01f, d);
            weightSum += w;
            sumX += b.transform.position.x * w;
            sumZ += b.transform.position.z * w;
        }

        if (weightSum < 1e-6f) return _smoothedPosition;

        return new Vector3(sumX / weightSum, transform.position.y, sumZ / weightSum);
    }

    private Vector3 EstimateLeastSquares()
    {
        int n = _beacons.Length;
        if (n < 3) return _smoothedPosition;

        // Use the first beacon as reference.
        Vector2 p0 = new Vector2(_beacons[0].transform.position.x, _beacons[0].transform.position.z);
        float r0 = _beacons[0].GetDistance(transform.position);

        // Build normal-equation matrices.
        float A11 = 0f, A12 = 0f, A22 = 0f;
        float B1 = 0f, B2 = 0f;

        for (int i = 1; i < n; i++)
        {
            Vector2 pi = new Vector2(_beacons[i].transform.position.x, _beacons[i].transform.position.z);
            float ri = _beacons[i].GetDistance(transform.position);

            float Xi = pi.x - p0.x;
            float Zi = pi.y - p0.y;

            float bi = 0.5f * (r0 * r0 - ri * ri - p0.x * p0.x + pi.x * pi.x - p0.y * p0.y + pi.y * pi.y);

            // Accumulate A^T * A
            A11 += Xi * Xi;
            A12 += Xi * Zi;
            A22 += Zi * Zi;

            // Accumulate A^T * b
            B1 += Xi * bi;
            B2 += Zi * bi;
        }

        // Solve 2x2 system
        float det = A11 * A22 - A12 * A12;
        if (Mathf.Abs(det) < 1e-6f)
        {
            return EstimateWeightedAverage();
        }

        float invDet = 1f / det;
        float x = (B1 * A22 - A12 * B2) * invDet;
        float z = (A11 * B2 - B1 * A12) * invDet;

        return new Vector3(x + p0.x, transform.position.y, z + p0.y);
    }

    #endregion

    void OnDrawGizmos()
    {
        if (!debugDraw || _beacons == null) return;
        
        // Draw beacon network (green lines to show triangulation)
        Gizmos.color = Color.green;
        foreach (var b in _beacons)
        {
            Gizmos.DrawLine(b.transform.position, _smoothedPosition);
            
            // Draw beacon positions as spheres
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(b.transform.position, 0.3f);
            Gizmos.color = Color.green;
        }
        
        // Draw current GPS estimated position (yellow)
        Gizmos.color = Color.yellow;
        Gizmos.DrawSphere(_smoothedPosition + Vector3.up * 0.2f, 0.15f);
        
        // Draw actual agent position (red) for comparison
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position + Vector3.up * 0.1f, 0.1f);
        
        // Draw GPS accuracy circle
        float accuracy = CalculateGPSAccuracy();
        Gizmos.color = new Color(1f, 1f, 0f, 0.3f);
        Gizmos.DrawWireSphere(_smoothedPosition, accuracy);
    }
    
    private float CalculateGPSAccuracy()
    {
        if (_beacons == null || _beacons.Length == 0) return 5f;
        
        float avgNoise = 0f;
        foreach (var beacon in _beacons)
        {
            avgNoise += beacon.noiseAmplitude;
        }
        return (avgNoise / _beacons.Length) * 3f; 
    }
} 
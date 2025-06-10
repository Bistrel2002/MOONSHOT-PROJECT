using UnityEngine;
using UnityEngine.AI;
using TMPro;
using System.Collections.Generic;

public class DestinationNavigator : MonoBehaviour
{
    public NavMeshAgent agent;
    public TMP_Dropdown destinationDropdown;

    [System.Serializable]
    public struct RoomDefinition
    {
        public string roomName;
        public Vector3 roomCenter;
    }

    [Tooltip("Define every room you want to appear in the dropdown along with its world-space centre.")]
    public RoomDefinition[] rooms;

    void Start()
    {
        // Populate dropdown with the room names provided in the inspector.
        var options = new List<string>();
        foreach (var r in rooms)
        {
            options.Add(r.roomName);
        }
        destinationDropdown.ClearOptions();
        destinationDropdown.AddOptions(options);

        destinationDropdown.onValueChanged.AddListener(MoveToSelectedDestination);
    }

    private void MoveToSelectedDestination(int index)
    {
        Debug.Log($"DestinationNavigator: Dropdown selection changed to index {index}");
        
        if (index >= 0 && index < rooms.Length)
        {
            Vector3 destination = rooms[index].roomCenter;
            Debug.Log($"DestinationNavigator: Moving to '{rooms[index].roomName}' at position {destination}");
            
            if (agent == null)
            {
                Debug.LogError("DestinationNavigator: NavMeshAgent reference is missing!");
                return;
            }
            
            if (!agent.enabled)
            {
                Debug.LogError("DestinationNavigator: NavMeshAgent is disabled!");
                return;
            }
            
            agent.SetDestination(destination);
            Debug.Log($"DestinationNavigator: SetDestination called. Agent hasPath: {agent.hasPath}, pathStatus: {agent.pathStatus}");
            
            // Additional debugging
            Debug.Log($"DestinationNavigator: Agent current position: {agent.transform.position}");
            Debug.Log($"DestinationNavigator: Agent on NavMesh: {agent.isOnNavMesh}");
            Debug.Log($"DestinationNavigator: Destination: {destination}");
            
            // Check if destination is on NavMesh
            UnityEngine.AI.NavMeshHit hit;
            bool destinationOnNavMesh = UnityEngine.AI.NavMesh.SamplePosition(destination, out hit, 5f, UnityEngine.AI.NavMesh.AllAreas);
            Debug.Log($"DestinationNavigator: Destination on NavMesh: {destinationOnNavMesh}");
            if (destinationOnNavMesh)
            {
                Debug.Log($"DestinationNavigator: Closest NavMesh point to destination: {hit.position}");
                Debug.Log($"DestinationNavigator: Distance to closest NavMesh point: {Vector3.Distance(destination, hit.position):F2}m");
            }
            
            // Check if there's a path between current position and destination
            UnityEngine.AI.NavMeshPath testPath = new UnityEngine.AI.NavMeshPath();
            bool pathExists = UnityEngine.AI.NavMesh.CalculatePath(agent.transform.position, destination, UnityEngine.AI.NavMesh.AllAreas, testPath);
            Debug.Log($"DestinationNavigator: Direct path calculation result: {pathExists}, path status: {testPath.status}");
            
            // Handle partial paths - get as close as possible
            if (testPath.status == UnityEngine.AI.NavMeshPathStatus.PathPartial)
            {
                Debug.Log("DestinationNavigator: PathPartial detected - using partial path to get as close as possible");
                agent.SetPath(testPath); // Use the partial path directly
                Debug.Log($"DestinationNavigator: Partial path set. Agent hasPath: {agent.hasPath}, pathStatus: {agent.pathStatus}");
            }
            else if (testPath.status == UnityEngine.AI.NavMeshPathStatus.PathComplete)
            {
                Debug.Log("DestinationNavigator: PathComplete - agent should reach exact destination");
            }
            else if (!pathExists || testPath.status == UnityEngine.AI.NavMeshPathStatus.PathInvalid)
            {
                Debug.LogWarning("DestinationNavigator: No valid path to destination!");
            }
        }
        else
        {
            Debug.LogWarning($"DestinationNavigator: Invalid room index {index}. Available rooms: {rooms.Length}");
        }
    }
}

using UnityEngine;
using UnityEngine.AI;
using TMPro;

public class DestinationNavigator : MonoBehaviour
{
    public NavMeshAgent agent;
    public TMP_Dropdown destinationDropdown;
    public Transform[] destinations;

    void Start()
    {
        destinationDropdown.onValueChanged.AddListener(delegate { MoveToSelectedDestination(); });
    }

    void MoveToSelectedDestination()
    {
        int index = destinationDropdown.value;
        if (index >= 0 && index < destinations.Length)
        {
            agent.SetDestination(destinations[index].position);
        }
    }
}

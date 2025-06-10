using UnityEngine;

[DisallowMultipleComponent]
public class VirtualBeacon : MonoBehaviour
{
    [Tooltip("Simulated measurement noise in metres that is added/subtracted from the true distance each time a sample is taken.")]
    [Range(0f, 1f)]
    public float noiseAmplitude = 0.2f;

    /// <summary>
    /// Simulates the distance measurement that a device would obtain from this beacon.
    /// A small configurable amount of random noise is applied so that subsequent readings are not perfectly identical.
    /// </summary>
    /// <param name="samplePosition">World-space position of the device taking the measurement.</param>
    /// <returns>Estimated distance (metres).</returns>
    public float GetDistance(Vector3 samplePosition)
    {
        float trueDistance = Vector3.Distance(samplePosition, transform.position);
        float noisyDistance = trueDistance + Random.Range(-noiseAmplitude, noiseAmplitude);
        return Mathf.Max(0.01f, noisyDistance); // keep strictly positive
    }
} 
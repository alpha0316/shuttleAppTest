// tspSolver.ts
export function solveTSP(waypoints: Coordinates[]): Coordinates[] {
    if (waypoints.length <= 1) return waypoints;
  
    const visited: Coordinates[] = [waypoints[0]]; // Start with the first waypoint
    let remaining = [...waypoints.slice(1)];
  
    while (remaining.length > 0) {
      const lastVisited = visited[visited.length - 1];
      let nearestIndex = 0;
      let nearestDistance = calculateDistance(lastVisited, remaining[0]);
  
      // Find the nearest unvisited waypoint
      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(lastVisited, remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
  
      // Add the nearest waypoint to the visited list
      visited.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1); // Remove the visited waypoint
    }
  
    return visited;
  }
  
  // Helper function to calculate the distance between two coordinates
  function calculateDistance(a: Coordinates, b: Coordinates): number {
    const dx = a.longitude - b.longitude;
    const dy = a.latitude - b.latitude;
    return Math.sqrt(dx * dx + dy * dy);
  }
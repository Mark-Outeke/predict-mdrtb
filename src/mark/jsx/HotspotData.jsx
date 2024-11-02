import { useEffect, useState, useCallback, useRef } from 'react';
import tracker from 'mark/api/tracker';
import * as turf from '@turf/turf';
import { buffer } from '@turf/turf';

// Utility function to calculate distance between two coordinates using the Haversine formula
const getDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(coord1.lat * (Math.PI / 180)) *
            Math.cos(coord2.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

const HotspotProcessor = ({ radius = 500, onHotspotsCalculated }) => {
  const trackedEntityType = "MCPQUTHX1Ze"; // Use the supplied trackedEntityType
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // To ensure fetch runs only once

  // Function to fetch tracked entity instances from DHIS2
  const fetchTrackedEntities = async () => {
    let details = {
      paging: false,
      trackedEntityType,
    };
    const orgUnits = ["yApOnywci25", "Q6qNTXu3yRx", "GuJvMV22ihs"]; // Supplied orgUnits
    
    if (tracker.useLegacyTrackerApi) {
      details.ou = orgUnits.join(';'); // Handle organization units
      details.skipPaging = 'true';
    } else {
      details.orgUnits = orgUnits.toString();
    }

    try {
      const response = await (tracker.useLegacyTrackerApi
        ? tracker.legacy.GetTrackedEntities(details)
        : tracker.GetTrackedEntities(details));
      
      return response.data.trackedEntityInstances || response.data.trackedEntities;
    } catch (error) {
      console.error('Error fetching tracked entities:', error);
      setError('Failed to fetch tracked entities');
      throw error;
    }
  };

  // Function to extract GIS Coordinates from the tracked entities
  const extractCoordinates = (instances) => {
    return instances.map((entity) => {
      const gisAttr = entity.attributes.find(attr => attr.displayName === 'GIS Coordinates');
      if (gisAttr) {
        try {
          const [lng, lat] = JSON.parse(gisAttr.value);
          return { lat, lng };
        } catch (error) {
          console.error('Invalid GIS Coordinates:', error);
        }
      }
      return null;
    }).filter((coord) => coord !== null); // Filter out invalid coordinates
  };

  // Function to calculate hotspots (clusters within a given radius)
  const calculateHotspots = useCallback((coords) => {
    const clusters = [];

    coords.forEach(coord => {
      let clusterFound = false;
      for (const cluster of clusters) {
        if (getDistance(coord, cluster.center) <= radius) {
          cluster.points.push(coord);
          clusterFound = true;
          cluster.center = {
            lat: (cluster.center.lat + coord.lat) / 2,
            lng: (cluster.center.lng + coord.lng) / 2,
          };
          break;
        }
      }
      if (!clusterFound) {
        clusters.push({ center: coord, points: [coord] });
      }
    });

    const circles = clusters.map(cluster => {
      const centroid = cluster.center;
      return buffer(turf.point([centroid.lng, centroid.lat]), radius, { units: 'meters' });
    });

    const validCircles = circles.filter(circle => 
      circle && 
      circle.geometry && 
      circle.geometry.type === 'Polygon' && 
      circle.geometry.coordinates &&
      Array.isArray(circle.geometry.coordinates) && 
      circle.geometry.coordinates.length > 0
    );

    const allCircleCoordinates = validCircles.length 
      ? validCircles.map(circle => circle.geometry.coordinates[0])
      : [];
      
    setHotspots(allCircleCoordinates);
    onHotspotsCalculated(allCircleCoordinates);
  }, [onHotspotsCalculated, radius]);

  useEffect(() => {
    const runFetch = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true; // Prevent subsequent fetches
        try {
          setIsLoading(true);
          const instances = await fetchTrackedEntities();
          const coordinates = extractCoordinates(instances);
          calculateHotspots(coordinates);
        } catch (error) {
          console.error('Error occurred during fetching or processing:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    runFetch();
  }, [calculateHotspots]);

  if (isLoading) {
    return <div>Loading hotspots...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Calculated Hotspots:</h3>
      <ul>
        {hotspots.map((hotspot, index) => (
          <li key={index}>
            Lat: {hotspot[1]}, Lng: {hotspot[0]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotspotProcessor;

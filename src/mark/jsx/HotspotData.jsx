import { useEffect, useState, useCallback, useRef } from 'react';
import tracker from 'mark/api/tracker';
import * as turf from '@turf/turf';
//import L from 'leaflet'; // Ensure Leaflet is imported

const HotspotProcessor = ({ setHeatmapData  }) => {
  const trackedEntityType = "MCPQUTHX1Ze";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchTrackedEntities = useCallback(async () => {
    const details = {
      paging: false,
      trackedEntityType,
    };
    const orgUnits = ["yApOnywci25", "Q6qNTXu3yRx", "GuJvMV22ihs"];
    
    if (tracker.useLegacyTrackerApi) {
      details.ou = orgUnits.join(';');
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
  }, []);



  const extractCoordinates = (instances) => {
    const coordinates = instances.map((entity) => {
      const gisAttr = entity.attributes.find(attr => attr.displayName === 'GIS Coordinates'); // Find the attribute
      if (gisAttr) {
        try {
          const [lng, lat] = JSON.parse(gisAttr.value); // Parse the coordinate string
          return { lat, lng }; // Return the coordinates as an object
        } catch (error) {
          console.error('Invalid GIS Coordinates:', error); // Error handling
        }
      }
      return null; // Return null if not found or parsing fails
    }).filter((coord) => coord !== null); // Filter out invalid coordinates
  
    console.log('Extracted Coordinates:', coordinates); // Print the extracted coordinates to the console
    return coordinates; // Return the filtered coordinates
  };
  


  const createHeatmap = useCallback((coordinates) => {
    // Prepare heatmap data
    const heatmapData = coordinates.map(coord => [coord.lat, coord.lng]);
    
    // Set heatmap data in the parent component
    setHeatmapData(heatmapData);
    console.log('Heatmap Data:', heatmapData); // Print the heatmap data to the console
    // Clustering logic remains unchanged...
    const points = coordinates.map(coord => turf.point([coord.lng, coord.lat]));
    const featureCollection = turf.featureCollection(points);
    
    
    
    const maxDistance = 0.0001; // Distance in kilometers
    const minPoints = 3;

    const clusters = turf.clustersDbscan(featureCollection, maxDistance, { minPoints, units: 'kilometers' });
    
    
    
    // Extract unique clusters and create polygons...
    
    return clusters.features; // Return clusters if needed for further processing
  }, [setHeatmapData]);


   
    



  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const runFetch = async () => {
      setIsLoading(true);
      try {
        const instances = await fetchTrackedEntities();
        const coordinates = extractCoordinates(instances);
        createHeatmap(coordinates);
      } catch (error) {
        console.error('Error occurred during fetching or processing:', error);
      } finally {
        setIsLoading(false);
      }
    };
    runFetch();
    runFetch();
  }, [fetchTrackedEntities, createHeatmap]);

  if (isLoading) return <div>Loading hotspots...</div>;
  if (error) return <div>Error: {error}</div>;

  return null;
};

export default HotspotProcessor;

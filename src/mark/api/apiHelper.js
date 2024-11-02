// src/mark/api/apiHelper.js
import tracker from './tracker'; // Adjust the import path accordingly

const fetchTrackedEntities = async (trackedEntityType, program, orgUnits, useLegacyTrackerApi) => {
  let details = {
    paging: false,
    trackedEntityType,
    program,
  };

  try {
    let response;
    if (useLegacyTrackerApi) {
      details.ou = orgUnits.toString().replaceAll(',', ';');
      details.skipPaging = 'true';
      response = await tracker.legacy.GetTrackedEntities(details);
    } else {
      details.orgUnits = orgUnits.toString();
      response = await tracker.GetTrackedEntities(details);
    }

    return response.data.trackedEntityInstances || response.data.trackedEntities;
  } catch (error) {
    console.error('Error fetching tracked entities:', error);
    throw error; // Re-throw the error to handle it later
  }
};

export { fetchTrackedEntities };

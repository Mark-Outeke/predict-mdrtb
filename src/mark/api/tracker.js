import axios from 'axios'




const tracker = {
    GetTrackedEntities : async (details)=>{
		return axios.get(`/api/tracker/trackedEntities`, {params: details});
    },

    GetTrackedEntityByID : async (trackedEntity, details)=>{
        return axios.get(`/api/tracker/trackedEntities/${trackedEntity}`, {params: details});
    },

    GetEvents : async (details)=>{
        return axios.get('/api/tracker/events', {params: details});
    },

    GetEnrollments : async (details)=>{
        return axios.get('/api/tracker/enrollments', {params: details});
    },
    GetOrganizationUnits : async (details)=>{
        return axios.get('/api/tracker/organisationUnits', {params: details});
    },
    GetOrganizationUnitsGeoFeatures : async (details)=>{
        return axios.get('/api/tracker/geoFeatures', {params: details});
    },


    legacy : {
        GetTrackedEntities : async (details)=>{
            return axios.get(`/api/trackedEntityInstances`, {params: details});
        },

        GetTrackedEntityByID : async (trackedEntity, details)=>{
            return axios.get(`/api/trackedEntityInstances/${trackedEntity}`, {params: details});
        },

        GetEvents : async (details)=>{
            return axios.get('/api/events', {params: details});
        },

        GetEnrollments : async (details)=>{
            return axios.get('/api/enrollments', {params: details});
        },
        GetDataElementsNameByID : async (details)=>{
            return axios.get ('/api/dataElements', {params:details});
        },
        GetOrganizationUnits : async (details)=>{
            return axios.get('/api/organisationUnits', {params:details});
        },
        GetOrganizationUnitsGeoFeatures : async (ou)=>{
            const params = {
                ou: ou
            };
            return axios.get('/api/geoFeatures', {params: params});
        },
    
    },


    useLegacyTrackerApi : false,
};


export default tracker;
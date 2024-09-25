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
        }
    },


    useLegacyTrackerApi : false,
};


export default tracker;
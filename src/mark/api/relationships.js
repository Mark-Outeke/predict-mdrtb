import axios from 'axios'

const relationships = {
    GetRelationships : async (params)=>{
		return axios.get(`/api/relationships`, {params:params});
    },
};


export default relationships;
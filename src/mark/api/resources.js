import axios from 'axios'

const resources = {
    GetResourceDescriptorList : async (params)=>{
		return axios.get(`/api/resources/`, { params,});
    }
};


export default resources;
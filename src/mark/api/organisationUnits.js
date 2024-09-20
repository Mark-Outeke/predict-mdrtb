import axios from 'axios'

const organisationUnits = {
    GetOrganisationUnits : async (details)=>{
		  return axios.get(`/api/organisationUnits`, {params:details});
    },
};


export default organisationUnits;
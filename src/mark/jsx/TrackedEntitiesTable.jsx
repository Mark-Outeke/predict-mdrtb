import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import tracker from 'mark/api/tracker';
import organisationUnits from 'mark/api/organisationUnits';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Header from './Header'; // Adjust the path as necessary
import Sidebar from './Sidebar'; // Adjust the path as necessary





const TrackedEntitiesTable = (props) => {

  const [trackedEntities, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgUnitDetails, setOrgUnitDetails] = useState([]);
 
  const navigate = useNavigate();

  useEffect(() => {


    const getTrackedEntities = async ()=>{

      let details = {
        paging: false,
        trackedEntityType: props.trackedEntityType,
        program: props.program,
      };

      if(tracker.useLegacyTrackerApi)
      {
        details.ou = props.orgUnits.toString().replaceAll(',', ';');
        details.skipPaging = "true";

        return tracker.legacy.GetTrackedEntities(details)

      }else
      {
        details.orgUnits = props.orgUnits.toString();
        return tracker.GetTrackedEntities(details)
      }
    }




    getTrackedEntities()
    .then((httpResponse)=>{

      if(tracker.useLegacyTrackerApi)
      {
        setInstances(httpResponse.data.trackedEntityInstances);

      }else
      {
        setInstances(httpResponse.data.trackedEntities);
      }

    }).catch ((error) => {
      console.error("Error fetching data: ", error);
    }).finally(()=> {
      setIsLoading(false);
    })

    const filter = 'id:in:[' + props.orgUnits.toString() + ']';

    organisationUnits.GetOrganisationUnits({
      paging: "false",
      filter,
      fields:"id,name,displayName,code",
    }).then((httpResponse)=>{

    setOrgUnitDetails(httpResponse.data.organisationUnits);

    }).catch((error)=>{
      console.error("Error fetching data: ", error);

    }).finally(()=>{
    })
      
  }, [props.orgUnits, props.trackedEntityType, props.program]);


  

  
  // Prepare data for react-table from attributes
  const data = React.useMemo(() => (
    
    trackedEntities.map(trackedEntity => {
      const attributesObject = {};
      trackedEntity.attributes.forEach(attr => {
        attributesObject[attr.displayName] = attr.value; // Use displayName as key
      });



      const getOrgUnitDisplayNameByID = (orgUnitID)=>{
        for(const orgUnitDetail of orgUnitDetails)
        {
          if(orgUnitDetail.id === orgUnitID)
          {
            return orgUnitDetail.displayName;
          }
        }
  
        return "Unknown";
  
      };

      return {
        orgUnit: getOrgUnitDisplayNameByID(trackedEntity.orgUnit),
        ...attributesObject // Spread the attributes object into the return object
      };
    })
  ), [trackedEntities, orgUnitDetails]);











  // Define columns based on displayNames dynamically
  const columns = React.useMemo(() => {
    if (trackedEntities.length && trackedEntities[0].attributes) {
      const attributeColumns = trackedEntities[0].attributes.map(attr => ({
            Header: attr.displayName,
            accessor: attr.displayName, // Use displayName as the accessor
      }));
      return [
        { Header: 'Org Unit', accessor: 'orgUnit' },
        ...attributeColumns
      ];
    }
    return []; // Return empty if no trackedEntities available
  }, [trackedEntities]);









  // Use react-table with pagination
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    setPageSize,
    gotoPage,
    page, // Current page rows
    canPreviousPage,
    canNextPage,
    pageOptions,
    previousPage, // Include previousPage function
    nextPage, // Include nextPage function
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 50 }, // Set initial page size
    },
    useSortBy,
    usePagination // Add usePagination to enable pagination
  );









  // Render loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle row click to navigate to InstanceDetails
  const handleRowClick = (row) => {
    console.log(trackedEntities[row.index]);
    //const selectedInstance = trackedEntities[row.index];
    //props.onEntitySelect(selectedInstance); // Pass the selected entity to the parent
    navigate('/instanceDetails', {
      state: {
        trackedEntity: trackedEntities[row.index]
      },
    });
  };

  return (
    <div className="App_mainCenterCanva">
      <Header />
      <div className="layout">
        <Sidebar />
        <div className="table-container">
          <table {...getTableProps()} className="table table-striped table-bordered">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {'<<'}
            </button>
            <button onClick={previousPage} disabled={!canPreviousPage}>
              {'<'}
            </button>
            <span>
              Page{' '}
              <strong>
                {state.pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
            <button onClick={nextPage} disabled={!canNextPage}>
              {'>'}
            </button>
            <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
              {'>>'}
            </button>
            <select
              value={state.pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20, 50, 100, 200, 300, 400, 500, 1000].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TrackedEntitiesTable;
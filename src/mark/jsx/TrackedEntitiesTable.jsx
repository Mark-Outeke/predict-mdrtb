import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import tracker from 'mark/api/tracker';
import organisationUnits from 'mark/api/organisationUnits';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header'; 
import Sidebar from './Sidebar'; 
import { useTrackedEntity } from 'TrackedEntityContext';

const TrackedEntitiesTable = (props) => {
  const [trackedEntities, setInstances] = useState([]);
  const [filteredTrackedEntities, setFilteredTrackedEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgUnitDetails, setOrgUnitDetails] = useState([]);
  const { updateTrackedEntity } = useTrackedEntity(); 
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const getTrackedEntities = async () => {
      let details = {
        paging: false,
        trackedEntityType: props.trackedEntityType,
        program: props.program,
      };

      if (tracker.useLegacyTrackerApi) {
        details.ou = props.orgUnits.toString().replaceAll(',', ';');
        details.skipPaging = 'true';
        return tracker.legacy.GetTrackedEntities(details);
      } else {
        details.orgUnits = props.orgUnits.toString();
        return tracker.GetTrackedEntities(details);
      }
    };

    getTrackedEntities()
      .then((httpResponse) => {
        const instances = tracker.useLegacyTrackerApi
          ? httpResponse.data.trackedEntityInstances
          : httpResponse.data.trackedEntities;

        setInstances(instances);
        setFilteredTrackedEntities(instances); // Set initial filtered state to all instances
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const filter = 'id:in:[' + props.orgUnits.toString() + ']';

    organisationUnits
      .GetOrganisationUnits({
        paging: 'false',
        filter,
        fields: 'id,name,displayName,code',
      })
      .then((httpResponse) => {
        setOrgUnitDetails(httpResponse.data.organisationUnits);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [props.orgUnits, props.trackedEntityType, props.program]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTrackedEntities(trackedEntities); // Reset to all instances if search is empty
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = trackedEntities.filter((entity) =>
        entity.attributes.some((attr) =>
          attr.value.toLowerCase().includes(lowercasedSearchTerm)
        )
      );
      setFilteredTrackedEntities(filtered);
    }
  }, [searchTerm, trackedEntities]);


  const data = React.useMemo(
  () =>
    filteredTrackedEntities.map((trackedEntity) => {
      const attributesObject = {};

      // Extracting from entity attributes
      trackedEntity.attributes.forEach((attr) => {
        attributesObject[attr.displayName] = attr.value;
      });

      // Extracting from enrollments attributes
      if (trackedEntity.enrollments && trackedEntity.enrollments.length > 0) {
        trackedEntity.enrollments[0].attributes.forEach((attr) => {
          attributesObject[attr.displayName] = attr.value;
        });
      }

      const getOrgUnitDisplayNameByID = (orgUnitID) => {
        const orgUnitDetail = orgUnitDetails.find(
          (unit) => unit.id === orgUnitID
        );
        return orgUnitDetail ? orgUnitDetail.displayName : 'Unknown';
      };
      let gisCoordinates = null;
      if (attributesObject['GIS Coordinates']) {
        try {
          gisCoordinates = JSON.parse(attributesObject['GIS Coordinates']);
          // Ensure it's in [lat, lng] format
          gisCoordinates = [parseFloat(gisCoordinates[1]), parseFloat(gisCoordinates[0])];
        } catch (error) {
          console.error('Invalid GIS Coordinates:', error);
          gisCoordinates = null;
        }
      }

      return {
        orgUnit: getOrgUnitDisplayNameByID(trackedEntity.orgUnit),
        gisCoordinates,
        ...attributesObject,
      };
    }),
  [filteredTrackedEntities, orgUnitDetails]
);


const columns = React.useMemo(() => [
  
 
  { Header: 'Family Name', accessor: 'GEN - Family name' },
  { Header: 'Given Name', accessor: 'GEN - Given name' },
  { Header: 'Patient Name', accessor: 'NTLP-01: Patient Name' },
  { Header: 'Sex', accessor: 'NTLP-04: Sex' },
  { Header: 'Org Unit', accessor: 'orgUnit' },
  { Header: 'TB No', accessor: 'DSATR-002: Unit TB No/DR TB No/Leprosy N' },
  { Header: 'Age in Years', accessor: 'NTLP-02: Age in years' },
  { Header: 'National ID', accessor: 'GEN - National ID'},
  { Header: 'GIS Coordinates', accessor: 'GIS Coordinates' },
  // Add any more headers here as needed
], []);


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    setPageSize,
    gotoPage,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    previousPage,
    nextPage,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 50 },
    },
    useSortBy,
    usePagination
  );

  const handleRowClick = (row) => {
    const selectedInstance = filteredTrackedEntities[row.index];
    updateTrackedEntity(selectedInstance);
    navigate('/TrackedEntityDetails', {
      state: { trackedEntity: selectedInstance,
        
        coordinates: selectedInstance.gisCoordinates, },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App_mainCenterCanva">
      <Header />
      <div className="layout">
        <Sidebar />
        <div className="table-container">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control mb-3"
          />

          <table
            {...getTableProps()}
            className="table table-striped table-bordered"
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
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
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => handleRowClick(row)}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

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
            <button
              onClick={() => gotoPage(pageOptions.length - 1)}
              disabled={!canNextPage}
            >
              {'>>'}
            </button>
            <select
              value={state.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50, 100, 500, 1000].map((size) => (
                <option key={size} value={size}>
                  Show {size}
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

import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import tracker from 'mark/api/tracker';
import organisationUnits from 'mark/api/organisationUnits';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header'; 
import Sidebar from './Sidebar'; 
import 'index.css'
import { useTrackedEntity } from 'mark/jsx/TrackedEntityContext';

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

  const mainContentStyle = {
    marginLeft: '270px',
    marginTop: '90px',
    padding: '30px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: 'calc(100vh - 90px)',
    borderRadius: '20px 0 0 0',
    boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
  };
  


  if (isLoading) {
    return (
      <div className="App_mainCenterCanva">
        <Header />
        <div className="layout">
          <Sidebar />
          <div style={mainContentStyle}>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
              <div className="text-center">
                <div className="loading-spinner"></div>
                <h4 className="mt-3 text-muted">Loading patient data...</h4>
                <p className="text-muted">Please wait while we fetch the information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App_mainCenterCanva">
      <Header />
      <div className="layout">
      <div className="d-flex">
        <Sidebar />
        <div style={mainContentStyle}>
          <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-2" style={{ color: '#1e293b', fontWeight: '700', fontSize: '2rem' }}>
                  Patient Records
                </h2>
                <p className="text-muted mb-0">
                  Total: <span className="badge bg-primary">{filteredTrackedEntities.length}</span> patients
                </p>
              </div>
              <div className="search-container" style={{ position: 'relative', width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 45px 12px 16px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  }}
                />
                <i className="fas fa-search" style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}></i>
              </div>
            </div>

            <div className="table-container" style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              padding: '0',
              overflow: 'hidden',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table
                  {...getTableProps()}
                  className="table mb-0"
                  style={{ minWidth: '1200px' }}
                >
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps(column.getSortByToggleProps())}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '16px 20px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              fontSize: '0.85rem',
                              letterSpacing: '0.5px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              position: 'relative',
                              borderBottom: 'none',
                            }}
                          >
                            {column.render('Header')}
                            <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                              {column.isSorted ? (column.isSortedDesc ? '↓' : '↑') : '⇅'}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row, index) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          onClick={() => handleRowClick(row)}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderBottom: index === page.length - 1 ? 'none' : '1px solid #e2e8f0',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.transform = 'scale(1.01)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} style={{
                              padding: '16px 20px',
                              borderBottom: 'none',
                              fontSize: '0.95rem',
                              color: '#374151',
                            }}>
                              {cell.render('Cell')}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination d-flex justify-content-between align-items-center p-4" style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                borderRadius: '0 0 16px 16px',
              }}>
                <div className="d-flex align-items-center gap-2">
                  <button 
                    onClick={() => gotoPage(0)} 
                    disabled={!canPreviousPage}
                    className="btn btn-outline-primary btn-sm"
                    style={{ borderRadius: '8px', minWidth: '40px' }}
                  >
                    ⟪
                  </button>
                  <button 
                    onClick={previousPage} 
                    disabled={!canPreviousPage}
                    className="btn btn-outline-primary btn-sm"
                    style={{ borderRadius: '8px', minWidth: '40px' }}
                  >
                    ⟨
                  </button>
                  <span className="mx-3" style={{ fontSize: '0.95rem', color: '#374151' }}>
                    Page <strong>{state.pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
                  </span>
                  <button 
                    onClick={nextPage} 
                    disabled={!canNextPage}
                    className="btn btn-outline-primary btn-sm"
                    style={{ borderRadius: '8px', minWidth: '40px' }}
                  >
                    ⟩
                  </button>
                  <button
                    onClick={() => gotoPage(pageOptions.length - 1)}
                    disabled={!canNextPage}
                    className="btn btn-outline-primary btn-sm"
                    style={{ borderRadius: '8px', minWidth: '40px' }}
                  >
                    ⟫
                  </button>
                </div>
                <select
                  value={state.pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="form-select"
                  style={{ 
                    width: 'auto', 
                    minWidth: '120px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                  }}
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
    </div>
    </div>
    </div>
  );
};

export default TrackedEntitiesTable;

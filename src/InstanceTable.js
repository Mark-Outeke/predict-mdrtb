// src/components/InstanceTable.js
import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchTrackedEntityInstancesAndOrgUnits } from './api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// InstanceTable component
const InstanceTable = () => {
  const [instances, setInstances] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Initialize navigate object

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading state to true before fetching
      try {
        const fetchedData = await fetchTrackedEntityInstancesAndOrgUnits('MCPQUTHX1Ze');
        setInstances(fetchedData.trackedEntityInstances);
        setOrgUnits(fetchedData.allOrgUnits);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching
      }
    };

    fetchData();
  }, []);

  // Prepare data for react-table from attributes
  const data = React.useMemo(() => (
    instances.map(instance => {
      const attributesObject = {};
      instance.attributes.forEach(attr => {
        attributesObject[attr.displayName] = attr.value; // Use displayName as key
      });

      return {
        orgUnit: orgUnits.find(unit => unit.id === instance.orgUnit)?.name || 'Unknown',
        ...attributesObject // Spread the attributes object into the return object
      };
    })
  ), [instances, orgUnits]);

  // Define columns based on displayNames dynamically
  const columns = React.useMemo(() => {
    if (instances.length && instances[0].attributes) {
      const attributeColumns = instances[0].attributes.map(attr => ({
        Header: attr.displayName,
        accessor: attr.displayName, // Use displayName as the accessor
      }));
      return [
        { Header: 'Org Unit', accessor: 'orgUnit' },
        ...attributeColumns
      ];
    }
    return []; // Return empty if no instances available
  }, [instances]);

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
      initialState: { pageSize: 5 }, // Set initial page size
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
    navigate('/instanceDetails', {
      state: {
        instance: instances[row.index], // Pass the clicked instance
        trackedEntityInstance: instances[row.index].trackedEntityInstance,
        //events: fetchEventsForInstance(instances[row.index].id), // Uncomment and implement if needed
      },
    });
  };

  return (
    <div className="App_mainCenterCanva">
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
  );
};

export default InstanceTable;

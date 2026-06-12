/**
 * Reusable DataTable component to replace duplicate table rendering logic
 * Used in AdminTaskStudents, SuperAdminTaskStudents, SuperAdminStudents, etc.
 * Removes 60+ lines of duplicate code
 */

export default function DataTable({ columns, data, loading = false, onRowClick = null }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center padding-2">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center padding-2">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id || row}
                onClick={() => onRowClick?.(row)}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

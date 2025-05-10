import React from "react";

/**
 * Table component for displaying transportation records
 */
const TransportTable = ({ records = [] }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th scope="col" width="5%">
              #
            </th>
            <th scope="col">Transportation Mode</th>
            <th scope="col">Begin Address</th>
            <th scope="col">End Address</th>
            <th scope="col">Date</th>
            <th scope="col" width="10%">
              Recurring
            </th>
          </tr>
        </thead>
        <tbody>
          {records?.length > 0 ? (
            records?.map((record, index) => (
              <tr key={record?._id}>
                <td>{index + 1}</td>
                <td>{record?.transportationMode}</td>
                <td>{record?.beginLocation}</td>
                <td>{record?.endLocation}</td>
                <td>{new Date(record?.date).toLocaleDateString()}</td>
                <td>{record?.recurring ? "Yes" : "No"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransportTable;

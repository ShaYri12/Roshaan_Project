import React from "react";
import { formatDecimal } from "../../../utils/dateUtils";

/**
 * Table component for displaying work transportation records
 */
const WorkTransportTable = ({ records = [] }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th scope="col" width="5%">
              #
            </th>
            <th scope="col">Car Type</th>
            <th scope="col">Vehicle</th>
            <th scope="col">CO₂ Emission</th>
            <th scope="col">Usage Type</th>
            <th scope="col">Work From Home Days</th>
            <th scope="col">Recurring Days</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {records?.length > 0 ? (
            records?.map((record, index) => (
              <tr key={record?._id}>
                <td>{index + 1}</td>
                <td>{record?.carType}</td>
                <td>{record?.transport?.name}</td>
                <td>{formatDecimal(record?.co2Emission)}</td>
                <td>{record?.usageType}</td>
                <td>{record?.workFromHomeDays}</td>
                <td>{record?.recurrenceDays}</td>
                <td>
                  {record?.date
                    ? new Date(record?.date).toLocaleDateString()
                    : ""}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkTransportTable;

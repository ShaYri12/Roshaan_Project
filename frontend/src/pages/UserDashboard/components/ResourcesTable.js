import React from "react";
import { formatDecimal } from "../../../utils/dateUtils";
import { isRecordEditable } from "../../../utils/dateUtils";

/**
 * Table component for displaying resource records
 */
const ResourcesTable = ({ resources = [], onEdit, onDelete }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th scope="col" width="5%">
              #
            </th>
            <th scope="col">Resource Type</th>
            <th scope="col">Quantity</th>
            <th scope="col">CO₂ Equivalent</th>
            <th scope="col">Date</th>
            <th scope="col" width="15%">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {resources?.length > 0 ? (
            resources?.map((resource, index) => (
              <tr key={resource?._id}>
                <td>{index + 1}</td>
                <td>{resource?.emissionType?.name}</td>
                <td>{formatDecimal(resource?.quantity)}</td>
                <td>{formatDecimal(resource?.co2Equivalent)}</td>
                <td>{new Date(resource?.date).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    {isRecordEditable(resource) ? (
                      <>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => onEdit(resource)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(resource._id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-muted small">
                        Locked (previous year)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No resources found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResourcesTable;

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const FollowUpModal = ({ modalId = "followUpModal", onSave }) => {
  return (
    <div className="modal fade" id={modalId} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-sm">
          
          {/* Header */}
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-semibold d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faComments} className="text-primary" />
              Follow Up
            </h5>
            <button className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">Remarks</label>
              <textarea
                className="form-control form-control-sm"
                rows="3"
                placeholder="Enter follow-up remarks"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Next Follow Up Date
                </label>
                <input type="date" className="form-control form-control-sm" />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select form-select-sm">
                  <option value="pending">Pending</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light">
            <button
              className="btn btn-sm btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button className="btn btn-sm btn-primary" onClick={onSave}>
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;

import { getAdminReports } from './adminController.js';

/**
 * Controller for dedicated Report operations
 */
export const getPlatformReports = async (req, res, next) => {
  return getAdminReports(req, res, next);
};

export const downloadReportCSV = async (req, res, next) => {
  req.query.format = 'csv';
  return getAdminReports(req, res, next);
};

export default {
  getPlatformReports,
  downloadReportCSV
};


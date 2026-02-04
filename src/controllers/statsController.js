import * as statsService from '../services/statsService.js';

export async function getStats(req, res) {
  try {
    const stats = await statsService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
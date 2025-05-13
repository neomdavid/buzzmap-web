const getAllReports = asyncErrorHandler(async (req, res) => {
  const { search } = req.query;
  
  let query = {};
  
  // If search query exists, create a search condition
  if (search) {
    query = {
      $or: [
        { 'user.username': { $regex: search, $options: 'i' } },
        { barangay: { $regex: search, $options: 'i' } },
        { report_type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .populate("user", "username");
    
  res.status(200).json(reports);
}); 
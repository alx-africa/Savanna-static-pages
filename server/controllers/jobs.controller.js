const prisma = require('../prisma');

async function listJobs(request, response, next) {
  try {
    const jobs = await prisma.jobMatch.findMany({
      where: { userId: request.params.id },
      orderBy: { createdAt: 'desc' }
    });
    response.json({ jobs });
  } catch (error) {
    next(error);
  }
}

module.exports = { listJobs };

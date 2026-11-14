const prisma = require('../prisma');

function profileData(body) {
  const allowed = ['name', 'location', 'bio', 'skills', 'accessibilityNeeds'];
  return Object.fromEntries(allowed
    .filter((key) => typeof body[key] === 'string')
    .map((key) => [key, body[key].trim().slice(0, 5000)]));
}

async function getProfile(request, response, next) {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: request.params.id } });
    if (!profile) {
      response.status(404).json({ error: 'Profile not found.' });
      return;
    }
    response.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(request, response, next) {
  try {
    const profile = await prisma.profile.upsert({
      where: { userId: request.params.id },
      update: profileData(request.body),
      create: { userId: request.params.id, ...profileData(request.body) }
    });
    response.json(profile);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };

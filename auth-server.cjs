require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured.');

app.use(express.json({ limit: '16kb' }));

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, maxLength) : '';
}

app.post('/api/v1/auth/register', async (request, response, next) => {
  try {
    const name = clean(request.body.name, 120);
    const email = clean(request.body.email, 254).toLowerCase();
    const phone = clean(request.body.phone, 30);
    const alternativeIdType = clean(request.body.alternativeIdType, 40);
    const idReference = clean(request.body.idReference, 100);
    const password = typeof request.body.password === 'string' ? request.body.password : '';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone ||
        !alternativeIdType || !idReference || password.length < 8 || password.length > 200) {
      response.status(400).json({ error: 'Please provide valid registration details.' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone, alternativeIdType, idReference, passwordHash },
      select: { id: true, name: true, email: true, phone: true, alternativeIdType: true, idReference: true }
    });
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
    response.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 'P2002') {
      response.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }
    next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'The server could not complete the request.' });
});

if (require.main === module) {
  app.listen(Number(process.env.PORT || 4174), () => console.log('Auth server is running.'));
}

module.exports = { app, prisma };

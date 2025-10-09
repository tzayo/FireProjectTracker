import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/', express.static(path.join(process.cwd(), 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Teams
app.get('/api/teams', async (_req, res) => {
  const teams = await prisma.team.findMany({ include: { members: true } });
  res.json(teams);
});

app.post('/api/teams', async (req, res) => {
  const { name, isActive } = req.body;
  const team = await prisma.team.create({ data: { name, isActive: isActive ?? true } });
  res.status(201).json(team);
});

// Hydrants
app.get('/api/hydrants', async (_req, res) => {
  const hydrants = await prisma.hydrant.findMany({ include: { nearestCabinet: true } });
  res.json(hydrants);
});

app.post('/api/hydrants', async (req, res) => {
  const { code, number, serial, connectorDiameter, latitude, longitude, address, locationDescription, status, openState, repairNeeds, nearestCabinetId, nearestCabinetDistanceMeters, showOnMap, notes } = req.body;
  const hydrant = await prisma.hydrant.create({ data: { code, number, serial, connectorDiameter, latitude, longitude, address, locationDescription, status, openState, repairNeeds, nearestCabinetId, nearestCabinetDistanceMeters, showOnMap, notes } });
  res.status(201).json(hydrant);
});

app.put('/api/hydrants/:id', async (req, res) => {
  const { id } = req.params;
  const { code, number, serial, connectorDiameter, latitude, longitude, address, locationDescription, status, openState, repairNeeds, nearestCabinetId, nearestCabinetDistanceMeters, showOnMap, notes } = req.body;
  const hydrant = await prisma.hydrant.update({ where: { id }, data: { code, number, serial, connectorDiameter, latitude, longitude, address, locationDescription, status, openState, repairNeeds, nearestCabinetId, nearestCabinetDistanceMeters, showOnMap, notes } });
  res.json(hydrant);
});

// Equipment Cabinets
app.get('/api/cabinets', async (_req, res) => {
  const cabinets = await prisma.equipmentCabinet.findMany();
  res.json(cabinets);
});

app.post('/api/cabinets', async (req, res) => {
  const { code, latitude, longitude, address, contents, status, notes } = req.body;
  const cabinet = await prisma.equipmentCabinet.create({ data: { code, latitude, longitude, address, contents, status, notes } });
  res.status(201).json(cabinet);
});

// Tasks
app.get('/api/tasks', async (_req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, dueAt, frequency, status, teamId, hydrantId, cabinetId } = req.body;
  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      frequency,
      status,
      teamId,
      hydrantId,
      cabinetId,
    },
  });
  res.status(201).json(task);
});

// Incidents
app.get('/api/incidents', async (_req, res) => {
  const incidents = await prisma.incident.findMany({ include: { team: true } });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const { title, description, severity, latitude, longitude, teamId, startedAt, resolvedAt } = req.body;
  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      severity,
      latitude,
      longitude,
      teamId,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined,
    },
  });
  res.status(201).json(incident);
});

// Maintenance
app.get('/api/maintenance', async (_req, res) => {
  const items = await prisma.maintenance.findMany({ include: { hydrant: true, cabinet: true } });
  res.json(items);
});

app.post('/api/maintenance', async (req, res) => {
  const { type, notes, hydrantId, cabinetId, performedAt } = req.body;
  const item = await prisma.maintenance.create({
    data: {
      type,
      notes,
      hydrantId,
      cabinetId,
      performedAt: performedAt ? new Date(performedAt) : undefined,
    },
  });
  res.status(201).json(item);
});

// GeoJSON for map
app.get('/api/map/features', async (_req, res) => {
  const [hydrants, cabinets] = await Promise.all([
    prisma.hydrant.findMany({ where: { showOnMap: true } }),
    prisma.equipmentCabinet.findMany(),
  ]);

  const features = [
    ...hydrants
      .filter((h) => h.latitude !== null && h.longitude !== null)
      .map((h) => ({
        type: 'Feature',
        properties: { type: 'hydrant', id: h.id, code: h.code, status: h.status },
        geometry: { type: 'Point', coordinates: [h.longitude as number, h.latitude as number] },
      })),
    ...cabinets
      .filter((c) => c.latitude !== null && c.longitude !== null)
      .map((c) => ({
        type: 'Feature',
        properties: { type: 'cabinet', id: c.id, code: c.code, status: c.status },
        geometry: { type: 'Point', coordinates: [c.longitude as number, c.latitude as number] },
      })),
  ];

  res.json({ type: 'FeatureCollection', features });
});

// Quarterly tasks generation: create inspection tasks for hydrants and cabinets
app.post('/api/tasks/generate-quarterly', async (_req, res) => {
  const [hydrants, cabinets] = await Promise.all([
    prisma.hydrant.findMany(),
    prisma.equipmentCabinet.findMany(),
  ]);

  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  const created = await prisma.$transaction([
    ...hydrants.map((h) =>
      prisma.task.create({
        data: {
          title: `בדיקת רבעון למק"ט ברז ${h.code}`,
          description: 'בדיקת תפקוד ולחץ, צילום ועדכון סטטוס',
          frequency: 'QUARTERLY',
          dueAt: due,
          hydrantId: h.id,
        },
      })
    ),
    ...cabinets.map((c) =>
      prisma.task.create({
        data: {
          title: `בדיקת רבעון לארון ${c.code}`,
          description: 'בדיקת מלאי, תוקף ומצב פיזי',
          frequency: 'QUARTERLY',
          dueAt: due,
          cabinetId: c.id,
        },
      })
    ),
  ]);

  res.json({ created: created.length });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

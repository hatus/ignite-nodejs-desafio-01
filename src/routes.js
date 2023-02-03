import { randomUUID } from 'node:crypto';

import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select('tasks', {
        description: search,
        title: search,
      });

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { description, title } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'title not specified.' }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'description not specified.' }));
      }

      const task = {
        id: randomUUID(),
        description,
        title,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', task);

      return res.writeHead(201).end();
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { description, title } = req.body;

      if (!description && !title) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: 'title or description are required.' })
          );
      }

      const [task] = database.select('tasks', { id });

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }));
      }

      const updatedTaskData = {
        description,
        title,
        updated_at: new Date(),
      };

      if (!description) {
        delete updatedTaskData.description;
      }

      if (!title) {
        delete updatedTaskData.title;
      }

      database.update('tasks', id, updatedTaskData);

      return res.writeHead(204).end();
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const [data] = database.select('tasks', { id });

      if (!data) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }));
      }

      const isTaskCompleted = data.completed_at !== null;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update('tasks', id, { completed_at });

      return res.writeHead(204).end();
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const [data] = database.select('tasks', { id });

      if (!data) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }));
      }

      database.delete('tasks', id);

      return res.writeHead(204).end();
    },
  },
];
